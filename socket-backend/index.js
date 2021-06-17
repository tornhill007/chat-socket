const express = require('express')
const app = express();
const cors = require("cors");
const httpServer = require("http").createServer(app);
const options = { /* ... */};
const usersInstance = require('./store')();
const usersTmpInstance = require('./store')();
const roomsInstance = require('./store')();
const connectedUsersInstance = require('./store')();
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

// const chatHandlers = require('.///')
//
// ///error
// module.exports = (socket) => {
//   return (handler) => {
//     return async (data, callback) => {
//       try {
//         const result = await handler(data, callback)
//         callback(result)
//       }catch (err){
//         callback({message: err.message})
//       }
//     }
//   }
// }
//
// ///userSocketM
// module.exports = (socket) => {
//   return (handler) => {
//     return async (data, callback) => {
//       const user = db.getUser({})
//       data.user = user
//       if (!user) throw new Error('')
//       await handler(data, callback)
//     }
//   }
// }
//
// //room
// module.exports = (socket) => {
//   return (handler) => {
//     return async (data, callback) => {
//       const room = db.getRoom({id: data.user.id})
//       data.room = room
//       await handler(data, callback)
//     }
//   }
// }
//
// module.exports = (socket) => {
//   const userSocketM = require()(socket)
//   const roomSocketM = require()(socket)
//   const errorSocketM = require()(socket)
//
//   const on = (event, handler) => socket.on(event, errorSocketM(userSocketM(roomSocketM(handler))))
//
//   on('/chat/get', async (data) => {
//
//   })
//
//
//   on('/chat/set', async (data) => {
//
//   })
// }

io.on("connection", async (socket) => {
  connections.push(socket);
  console.log(socket.handshake.query.loggeduser);

  // chatHandlers(socket)
  // roomHandlers(socket)
  // adminHandlers(socket)
  // chatHandlers(socket)
  // chatHandlers(socket)
  // chatHandlers(socket)

  if (socket.handshake.query.loggeduser !== "null") {
    let decoded = jwt.verify(socket.handshake.query.loggeduser.split(' ')[1], keys.jwt);
    let user = await Users.getUserByUserId(decoded.userId);
    if (user) {
      if (user.userid === decoded.userId) {
        connectedUsersInstance.add({socketId: socket.id, userId: user.userid})
        console.log("correct connection")
      }
    }
  }

  socket.on("users/left", async (callback) => {
    console.log(usersInstance);
    let decoded = jwt.verify(socket.handshake.query.loggeduser.split(' ')[1], keys.jwt);
    let userInfo = await Users.getUserByUserId(decoded.userId);
    const connectedUser = connectedUsersInstance.getBySocketId(socket.id);
    if (userInfo) {
      if (userInfo.userid === decoded.userId) {
        let removedConnectedUser = connectedUsersInstance.removeConnectedUserById(socket.id)
        let removedUser = usersTmpInstance.remove(connectedUser.userId, socket.id);
        console.log(usersInstance);
        let isUserInRoom;
        let usersInRoom = usersTmpInstance.getByRoom(removedUser.room)
        isUserInRoom = usersInRoom.find(item => item.id === connectedUser.userId);
        let user;
        if (!isUserInRoom) {
          user = usersInstance.removeById(removedUser.id)[0];
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
            io.to(user.room).emit("users/update", usersInstance.getByRoom(user.room));
            let userInRoom = usersInstance.getByRoom(user.room);
            if (!userInRoom || userInRoom.length === 0) {
              roomsInstance.removeByRoomId(user.room);
              let createdRooms = roomsInstance.getAll();
              io.emit("rooms/getAll", createdRooms)
              let history = await History.findOne({
                where: {
                  roomid: user.room
                }
              });
              await history.destroy();
            }
          }
        }
        callback();
      }
    }
  })

  socket.on("rooms/get", (data, callback) => {
    let createdRooms = roomsInstance.getAll();
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
    let usersInRoom = usersInstance.getByRoom(roomId);

    socket.join(roomId);

    usersTmpInstance.add({
      id: user.userid,
      name: user.username,
      room: roomId,
      socketId: socket.id
    })

    let isUserInRoom = usersInRoom.find(item => item.id === user.userid)

    if (user && !isUserInRoom ) {

      if (user.userid === decoded.userId) {
        // users.remove(user.userid);
        usersInstance.add({
          id: user.userid,
          name: user.username,
          room: roomId,
          socketId: socket.id
        })

        let room = roomsInstance.getByRoomId(roomId);
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

        let createdRooms = roomsInstance.getAll();

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
    io.to(roomId).emit("users/update", usersInstance.getByRoom(roomId));
  })

  socket.on('disconnect', async (data) => {
    console.log("correct disconnection")
    const connectedUser = connectedUsersInstance.getBySocketId(socket.id);
    if (connectedUser) {
      let removedConnectedUser = connectedUsersInstance.removeConnectedUserById(socket.id)
      let removedUser = usersTmpInstance.remove(connectedUser.userId, socket.id);
      console.log(usersInstance);
      let isUserInRoom;
      let usersInRoom = usersTmpInstance.getByRoom(removedUser.room)
      isUserInRoom = usersInRoom.find(item => item.id === connectedUser.userId);

      // if(removedUser) {
      //   let usersInRoom = usersTmp.getByRoom(removedUser.room)
      //   isUserInRoom = usersInRoom.find(item => item.id === connectedUser.userId);
      //   console.log(isUserInRoom)
      // }
      // let usersInRoom = usersTmp.getByRoom(removedUser.room)
      // let isUserInRoom = usersInRoom.find(item => item.id === connectedUser.userId);
      let user;
      if (!isUserInRoom) {

        // let checkUsersInRoom = usersInstance.getByRoom(removedUser.room);
        // let checkedUsersInRoom = checkUsersInRoom.filter(item => item.id === removedUser.id);
        // if(checkedUsersInRoom.length > 0) {
        //   user = usersInstance.removeById(connectedUser.userId)[0];
        // }
        // else {
        //   user = usersInstance.remove(connectedUser.userId, socket.id);
        // }
        user = usersInstance.removeById(removedUser.id)[0];
        // user = usersInstance.remove(connectedUser.userId, socket.id);
      }
        if (user) {
        io.to(user.room).emit("users/update", usersInstance.getByRoom(user.room));
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

        let userInRoom = usersInstance.getByRoom(user.room);

        if (!userInRoom || userInRoom.length === 0) {
          roomsInstance.removeByRoomId(user.room);
          let createdRooms = roomsInstance.getAll();
          io.emit("rooms/getAll", createdRooms);
          let history = await History.findOne({
            where: {
              roomid: user.room
            }
          });
          await history.destroy();
        }
      }
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

    // const user = usersInstance.get(userInfo.userid, socket.id);
    let user = usersTmpInstance.getAllById(userInfo.userid);
    if(user.length > 1) {
      user = usersTmpInstance.get(userInfo.userid, socket.id);
    }

    if (user) {

      io.to(Array.isArray(user) ? user[0].room : user.room).emit('messages/new', m(Array.isArray(user) ? user[0].name : user.name, data.message, userInfo.userid))
      let history = await History.findOne({
        where: {
          roomid: Array.isArray(user) ? user[0].room : user.room
        }
      });
      const cloneHistory = JSON.parse(JSON.stringify(history.history));
      cloneHistory.push({name: `${Array.isArray(user) ? user[0].name : user.name}`, text: `${data.message}`});
      history.history = cloneHistory;
      await history.save();
    }
    callback();
  })
});

httpServer.listen(8080, () => {
  console.log("Server has started on 8080 port")
});






