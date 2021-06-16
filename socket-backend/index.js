const express = require('express')
const app = express();
const cors = require("cors");
const httpServer = require("http").createServer(app);
const options = { /* ... */};
const users = require('./users')();
const usersTmp = require('./usersTmp')();
const roomsInstance = require('./rooms')();
const connectedUsers = require('./connectedUsers')();
const passport = require("passport");
const sequelize = require('./config/database')
const generateUID = require('./common/generateUID')
const History = require('./models/History')
const Users = require('./models/Users')
const jwt = require("jsonwebtoken");
const keys = require('./config/keys');

const auth = require('./routes/auth');
const usersRoute = require('./routes/users');
const history = require('./routes/history');

//Test DB
app.use(cors());
app.use(express.json());

sequelize.authenticate().then(() => {
    console.log("Database connected...")
}).catch((err) => {
    console.log("Error:" + err);
})
// app.use(passport.authenticate('jwt', {session: false}));
app.use(auth);
app.use(usersRoute);
app.use(history);

app.use(passport.initialize());
require('./middleware/passport')(passport);

const io = require("socket.io")(httpServer, {
    cors: {
        origin: '*',
    }
});

let connections = [];

const m = (name, text, id) => ({name, text, id})

io.on("connection", async (socket) => {
    connections.push(socket);
    console.log(socket.handshake.query.loggeduser);
    if (socket.handshake.query.loggeduser !== "null") {
        let decoded = jwt.verify(socket.handshake.query.loggeduser.split(' ')[1], keys.jwt);
        let user = await Users.getUserByUserId(decoded.userId);
        if (user) {
            if (user.userid === decoded.userId) {
                connectedUsers.add({socketId: socket.id, userId: user.userid})
                console.log("correct connection")
            }
        }
    }

    socket.on("users/left", async (callback) => {
        console.log(users);
        let decoded = jwt.verify(socket.handshake.query.loggeduser.split(' ')[1], keys.jwt);
        let userInfo = await Users.getUserByUserId(decoded.userId);
        if (userInfo) {
            if (userInfo.userid === decoded.userId) {
                let allConnectedUser = connectedUsers.getAll();
                let removedConnectedUser = connectedUsers.remove(socket.id)
                // let amountUsersConnected = allConnectedUser.filter(item => item.userId === userInfo.userid);
                // const connectedUser = connectedUsers.get(socket.id);
                // if(connectedUser) {
                let removedUser = usersTmp.remove(removedConnectedUser.userId, socket.id);
                let usersInRoom = usersTmp.getByRoom(removedUser.room);
                console.log(usersInRoom)
                let isUserInRoom = usersInRoom.find(item => item.id === removedConnectedUser.userId);
                let user;
                if(!isUserInRoom) {
                    user = users.remove(removedConnectedUser.userId);
                }
                // if(amountUsersConnected.length <= 1) {
                    // const user = users.remove(userInfo.userid);
                    if (user) {
                        io.to(user.room).emit('messages/new', m("admin", `User ${user.name} left`));

                        let history = await History.findOne({
                            where: {
                                roomid: user.room
                            }
                        });
                        const cloneHistory = JSON.parse(JSON.stringify(history.history));
                        cloneHistory.push({name: 'admin', text: `User ${user.name} left`});
                        history.history = cloneHistory;
                        await history.save();
                        io.to(user.room).emit("users/update", users.getByRoom(user.room));
                        let userInRoom = users.getByRoom(user.room);
                        if (!userInRoom || userInRoom.length === 0) {
                            roomsInstance.remove(user.room);
                            let createdRooms = roomsInstance.getAllRooms();
                            io.emit("rooms/getAll", createdRooms)
                            let history = await History.findOne({
                                where: {
                                    roomid: user.room
                                }
                            });
                            await history.destroy();
                        }
                    }
                // }
                callback();
            }
        }
    })

    socket.on("rooms/get", (data, callback) => {
        let createdRooms = roomsInstance.getAllRooms();
        socket.emit("rooms/getAll", createdRooms)
        callback();
    })

    socket.on("users/joined", async (data, callback) => {
        if (!data) {
            return callback("Incorrect data")
        }
        let roomId;

        if (data.room.id) {
            roomId = data.room.id
        } else {
            roomId = generateUID();
            socket.emit('rooms/generateId', roomId);
        }

        let decoded = jwt.verify(socket.handshake.query.loggeduser.split(' ')[1], keys.jwt);
        let user = await Users.getUserByUserId(decoded.userId);
        let usersInRoom = users.getByRoom(roomId);

        socket.join(roomId);

        usersTmp.add({
            id: user.userid,
            name: user.username,
            room: roomId,
            socketId: socket.id
        })

        let isUserInRoom = usersInRoom.find(item => item.id === user.userid)

        if (user && !isUserInRoom) {

            if (user.userid === decoded.userId) {
                // users.remove(user.userid);
                users.add({
                    id: user.userid,
                    name: user.username,
                    room: roomId
                })

                let room = roomsInstance.get(roomId);
                if (!room) {
                    data.room.id = roomId
                    roomsInstance.add(data.room);
                }

                callback({userId: user.userid})

                socket.emit('messages/new', m('admin', `Welcome, ${user.username}`));
                console.log(socket.handshake.query.loggeduser);
                let history;
                let cloneHistory;
                history = await History.findOne({
                    where: {
                        roomid: roomId
                    }
                });

                if (!history) {
                    history = History.build({
                        roomid: roomId,
                        history: [{name: 'admin', text: `Welcome, ${user.username}`}]
                    })
                } else {
                    cloneHistory = JSON.parse(JSON.stringify(history.history));
                    cloneHistory.push({name: 'admin', text: `Welcome, ${user.username}`})
                    history.history = cloneHistory;
                }

                let createdRooms = roomsInstance.getAllRooms();

                io.emit("rooms/getAll", createdRooms)

                socket.broadcast.to(roomId).emit('messages/new', m('admin', `User ${user.username} joined`))

                if (cloneHistory) {
                    cloneHistory.push({name: 'admin', text: `User ${user.username} joined`})
                    history.history = cloneHistory;
                } else {
                    cloneHistory = JSON.parse(JSON.stringify(history.history));
                    cloneHistory.push({name: 'admin', text: `User ${user.username} joined`})
                    history.history = cloneHistory;
                }
                await history.save();
            }
        } else {
            socket.emit('messages/new', m('admin', false));
        }
        io.to(roomId).emit("users/update", users.getByRoom(roomId));
    })

    socket.on('disconnect', async (data) => {
        // connections.splice(connections.indexOf(socket), 1);
        console.log("correct disconnection")
        const connectedUser = connectedUsers.get(socket.id);
        if (connectedUser) {
            let removedConnectedUser = connectedUsers.remove(socket.id)
            let inUserConnected = connectedUsers.getAll();
            console.log(usersTmp);
            let removedUser = usersTmp.remove(connectedUser.userId, socket.id);
           let usersInRoom = usersTmp.getByRoom(removedUser.room)
            console.log(usersInRoom)
            // let isUserInRoom = inUserConnected.find(item => item.userId === connectedUser.userId);
            let isUserInRoom = usersInRoom.find(item => item.id === connectedUser.userId);
            let user;
           if(!isUserInRoom) {
               user = users.remove(connectedUser.userId);
           }
            // if (usersInRoom.length === 0) {
                if (user) {
                    io.to(user.room).emit("users/update", users.getByRoom(user.room));
                    io.to(user.room).emit("messages/new", m("admin", `User ${user.name} left`))
                    let history = await History.findOne({
                        where: {
                            roomid: user.room
                        }
                    });
                    const cloneHistory = JSON.parse(JSON.stringify(history.history));
                    cloneHistory.push({name: 'admin', text: `User ${user.name} left`});
                    history.history = cloneHistory;
                    await history.save();

                    let userInRoom = users.getByRoom(user.room);

                    if (!userInRoom || userInRoom.length === 0) {
                        roomsInstance.remove(user.room);
                        let createdRooms = roomsInstance.getAllRooms();
                        io.emit("rooms/getAll", createdRooms);
                        let history = await History.findOne({
                            where: {
                                roomid: user.room
                            }
                        });
                        await history.destroy();
                    }
                }
            // }
        }
    })

    socket.on("createMessage", async (data, callback) => {

        if (!data) {
            return callback('Incorrect data');
        }
        console.log(socket.id)
        let decoded = jwt.verify(socket.handshake.query.loggeduser.split(' ')[1], keys.jwt);
        let userAuth = await Users.getUserByUserId(decoded.userId);
        let userInfo;
        if (userAuth) {
            if (userAuth.userid === decoded.userId) {
                userInfo = userAuth;
            }
        }
        const user = users.get(userInfo.userid);
        if (user) {
            io.to(user.room).emit('messages/new', m(user.name, data.message, userInfo.userid))
            let history = await History.findOne({
                where: {
                    roomid: user.room
                }
            });
            const cloneHistory = JSON.parse(JSON.stringify(history.history));
            cloneHistory.push({name: `${user.name}`, text: `${data.message}`});
            history.history = cloneHistory;
            await history.save();
        }
        callback();
    })
});

httpServer.listen(8080, () => {
    console.log("Server has started on 8080 port")
});






