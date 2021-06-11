const express = require('express')
const app = express();
const cors = require("cors");
const httpServer = require("http").createServer(app);
const options = { /* ... */};
const users = require('./users')();
const roomsInstance = require('./rooms')();
const connectedUsers = require('./connectedUsers')();
const passport = require("passport");
const sequelize = require('./config/database')
const generateUID = require('./common/generateUID')

const auth = require('./routes/auth');
const usersRoute = require('./routes/users');

//Test DB
app.use(cors());
app.use(express.json());


sequelize.authenticate().then(() => {
    console.log("Database connected...")
}).catch((err) => {
    console.log("Error:" + err);
})

app.use(auth);
app.use(usersRoute);

app.use(passport.initialize());
require('./middleware/passport')(passport);

const io = require("socket.io")(httpServer, {
    cors: {
        origin: '*',
    }
});

let connections = [];

const m = (name, text, id) => ({name, text, id})

io.on("connection", (socket) => {
    connections.push(socket);
    console.log(socket.handshake.query.loggeduser);
    if(socket.handshake.query.loggeduser !== "null") {
        connectedUsers.add({socketId: socket.id, userId: socket.handshake.query.loggeduser})
    }

    console.log("correct connection")

    socket.on("users/left", (id, callback) => {
        console.log(users);
        const user = users.remove(id);
        if(user) {
            io.to(user.room).emit('messages/new', m("admin", `User ${user.name} left`));
            // let rooms = Array.from(io.sockets.adapter.rooms).map(item => {
            //     return item[0];
            // });
            // let createdRooms = roomsInstance.getAllRooms();
            io.to(user.room).emit("users/update", users.getByRoom(user.room));
            let userInRoom = users.getByRoom(user.room);
            if(!userInRoom || userInRoom.length === 0) {
                roomsInstance.remove(user.room);
                let createdRooms = roomsInstance.getAllRooms();
                io.emit("rooms/getAll", createdRooms)
            }

        }
        callback();
    })

    socket.on("rooms/get", (data, callback) => {
        // let rooms = Array.from(io.sockets.adapter.rooms).map(item => {
        //     return item[0];
        // });
        let createdRooms = roomsInstance.getAllRooms();
        socket.emit("rooms/getAll", createdRooms)
        callback();
    })
    // let rooms = io.sockets.adapter.rooms;
    // socket.emit("getAllRooms", rooms)

    socket.on("users/joined", (data, callback) => {
        if (!data) {
            return callback("Incorrect data")
        }
        let roomId;

        if(data.room.id) {
            roomId = data.room.id
        }
        else {
            roomId = generateUID();
            socket.emit('rooms/generateId', roomId);
        }

        socket.join(roomId)

        users.remove(data.id);
        users.add({
            id: data.id,
            name: data.userName,
            room: roomId
        })

        let room = roomsInstance.get(roomId);
        if(!room) {
            data.room.id = roomId
            roomsInstance.add(data.room);
        }

        callback({userId: data.id})

        // let usersInRoom =  users.getByRoom(data.room.id);
        io.to(roomId).emit("users/update", users.getByRoom(roomId));

        socket.emit('messages/new', m('admin', `Welcome, ${data.userName}`));

        let rooms = Array.from(io.sockets.adapter.rooms).map(item => {
            return item[0];
        });

        let createdRooms = roomsInstance.getAllRooms();

        io.emit("rooms/getAll", createdRooms)


        socket.broadcast.to(roomId).emit('messages/new', m('admin', `User ${data.userName} joined`))
    })

    socket.on('disconnect', (data) => {
        connections.splice(connections.indexOf(socket), 1);
        console.log("correct disconnection")
        const connectedUser = connectedUsers.get(socket.id);
        if(connectedUser) {
            const user = users.remove(connectedUser.userId);
            if(user) {
                io.to(user.room).emit("users/update", users.getByRoom(user.room));
                io.to(user.room).emit("messages/new", m("admin", `User ${user.name} left`))

                let userInRoom = users.getByRoom(user.room);
                if(!userInRoom || userInRoom.length === 0) {
                    roomsInstance.remove(user.room);
                    let createdRooms = roomsInstance.getAllRooms();
                    io.emit("rooms/getAll", createdRooms)
                }
            }

        }

    })

    // socket.on("createMessage", (data, callback) => {
    //     if (!data) {
    //         return callback('Incorrect data');
    //     }
    //
    //     const user = users.get(data.id);
    //     if(user) {
    //         io.to(user.room.name).emit('newMessage', m(user.name, data.message, data.id))
    //     }
    //     callback();
    //
    // })

    socket.on("createMessage", (data, callback) => {

        if (!data) {
            return callback('Incorrect data');
        }

        const user = users.get(data.id);
        if (user) {
            io.to(user.room).emit('messages/new', m(user.name, data.message, data.id))
        }
        callback();

    })

    // socket.on("send message", (data) => {
    //     io.emit("add message", {
    //         msg: data
    //     })
    // })

    // socket.on("error", e => socket.send(e));
    // socket.send('Hi there, I am a WebSocket server');
});

httpServer.listen(8080, () => {
    console.log("Server has started on 8080 port")
});






