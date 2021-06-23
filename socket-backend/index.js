const express = require('express')
const app = express();
const cors = require("cors");
const httpServer = require("http").createServer(app);
const options = { /* ... */};
const usersInstance = require('./store')();
const usersTmpInstance = require('./store')();
const roomsInstance = require('./store')();
const connectedUsersInstance = require('./store')();
const buildNewRecord = require('./common/buildNewRecord');
const exitFromRoom = require('./common/exitFromRoom');
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
      socket.user = user;
      connectedUsersInstance.add({socketId: socket.id, userId: user.userid, token: socket.handshake.query.loggeduser.substr(-4)})
      console.log("correct connection")
    }
  }

  socket.on("users/left", async (callback) => {
    await exitFromRoom(socket.id, io, m, usersTmpInstance, usersInstance, connectedUsersInstance, roomsInstance);
    callback()
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

    let user = socket.user;
    let usersInRoom = usersInstance.getByRoom(roomId);

    socket.join(roomId);

    usersTmpInstance.add({
      id: user.userid,
      name: user.username,
      room: roomId,
      socketId: socket.id,
      token: socket.handshake.query.loggeduser.substr(-4)
    })

    let isUserInRoom = usersInRoom.find(item => item.id === user.userid)

    if (isUserInRoom) {
      socket.emit('messages/new', m('admin', false));
      io.to(roomId).emit("users/update", usersInstance.getByRoom(roomId));
      return callback("111")
    }

    usersInstance.add({
      id: user.userid,
      name: user.username,
      room: roomId,
      socketId: socket.id,
      token: socket.handshake.query.loggeduser.substr(-4)
    })

    let room = roomsInstance.getById(roomId);
    if (!room) {
      data.room.id = roomId
      roomsInstance.add(data.room);
    }

    callback({userId: user.userid})

    socket.emit('messages/new', m('admin', `Welcome, ${user.username}`));
    console.log(socket.handshake.query.loggeduser);

    await buildNewRecord(roomId, null, {name: 'admin', text: `Welcome, ${user.username}`});

    let createdRooms = roomsInstance.getAll();

    io.emit("rooms/getAll", createdRooms)

    socket.broadcast.to(roomId).emit('messages/new', m('admin', `User ${user.username} joined`))

    await buildNewRecord(roomId, null, {name: 'admin', text: `User ${user.username} joined`})

    io.to(roomId).emit("users/update", usersInstance.getByRoom(roomId));
  })

  socket.on('disconnect', async (data) => {
    console.log("correct disconnection")
    await exitFromRoom(socket.id, io, m, usersTmpInstance, usersInstance, connectedUsersInstance, roomsInstance);
  })

  socket.on("createMessage", async (data, callback) => {

    if (!data) {
      return callback('Incorrect data');
    }
    let userInfo = socket.user

    let user = usersTmpInstance.get(userInfo.userid, socket.id);

    if (user) {
      io.to(user.room).emit('messages/new', m(user.name, data.message, userInfo.userid))

      await buildNewRecord(user.room, userInfo.userid, {
        name: `${user.name}`,
        text: `${data.message}`
      })
    }
    callback();
  })
});

httpServer.listen(8080, () => {
  console.log("Server has started on 8080 port")
});
