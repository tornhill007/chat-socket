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
const Tabs = require('./models/Tabs')
const Users = require('./models/Users')
const Rooms = require('./models/Rooms')
const UsersMain = require('./models/UsersMain')
const ConnectedUsers = require('./models/ConnectedUsers')
const UsersTmp = require('./models/UsersTmp')
const jwt = require("jsonwebtoken");
const keys = require('./config/keys');

const auth = require('./routes/auth');
const usersRoute = require('./routes/users');
const history = require('./routes/history');
const Op = require('sequelize').Op;

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
/////userSocketM
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
    console.log("[SOCKET_ID]", socket.id);
    let decoded = jwt.verify(socket.handshake.query.loggeduser.split(' ')[1], keys.jwt);
    let user = await Users.getUserByUserId(decoded.userId);
    if (!user) {
      return;
    }

    let tab = await Tabs.findOne({
      where: {
        tabid: socket.handshake.query.tabId
      }
    });
    if(!tab) {
      await user.createTab({tabid: socket.handshake.query.tabId});
    }
    else {
     let room = await Rooms.findOne({
       include: [{
         model: Tabs,
         required: true,
         where: {
           tabid: socket.handshake.query.tabId
         }
       }]
     })
      if(room) {
        socket.join(room.roomid);
      }
    }

    socket.user = user;
    console.log("correct connection")
  }

  socket.on("users/left", async (callback) => {
    // await exitFromRoom(socket.id, io, m);

    let user = socket.user;
    let tab = await Tabs.findOne({
      where: {
        tabid: socket.handshake.query.tabId
      }
    })

    let room = await Rooms.findOne({
      include: [{
        model: Tabs,
        required: true,
        where: {
          tabid: socket.handshake.query.tabId
        }
      }]
    })

    await tab.destroy();

    let tabRoom = await Tabs.findOne({
      where: {
        roomid: room.roomid,
        tabid: socket.handshake.query.tabId
      }
    })

    await tabRoom.destroy();

    let usersByRoom = await Rooms.findOne({
      where: {
        roomid: room.roomid
      },
      include: [{
        model: Tabs,
        required: true
      }]
    });

    if(usersByRoom) {
      let tabs = []


      usersByRoom.tabs.forEach(tab => {
        tabs.push(tab.tabid)
      })

      let usersInRoom = await Users.findAll({
        include: [{
          model: Tabs,
          where: {
            tabid: tabs
          }
        }]
      })

      let isUserInRoom = usersInRoom.find(item => item.userid === user.userid);

      if(usersInRoom.length === 0) {
        let roomTmp = await Rooms.findOne({
          where: {
            roomid: room.roomid
          }
        })
        await roomTmp.destroy();
      }

      if(!isUserInRoom) {
        io.to(room.roomid).emit("users/update", usersInRoom);
        io.to(room.roomid).emit("messages/new", m("admin", `User ${user.username} left`))
        await buildNewRecord(room.roomid, null, {name: 'admin', text: `User ${user.username} left`})
      }
    }
    else {
      let roomTmp = await Rooms.findOne({
        where: {
          roomid: room.roomid
        }
      })
      await roomTmp.destroy();
    }
    let createdRooms = await Rooms.findAll();
    io.emit("rooms/getAll", createdRooms);
    console.log(123)
    
    
    callback()
  })

  socket.on("rooms/get", async (data, callback) => {
    let createdRooms = await Rooms.findAll();
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

    socket.join(roomId);

    let room = await Rooms.findOne({
      where: {
        roomid: roomId
      }
    })

    if (!room) {
      data.room.id = roomId
      let newRoom = Rooms.build({
        roomid: data.room.id,
        roomname: data.room.name
      })

      newRoom.createTab({tabid: socket.handshake.query.tabId});

      await newRoom.save();

    } else {
      room.createTab({tabid: socket.handshake.query.tabId});

    }

    callback({userId: user.userid})


    let createdRooms = await Rooms.findAll();

    io.emit("rooms/getAll", createdRooms);


    let usersByRoom = await Rooms.findOne({
      where: {
        roomid: roomId
      },
      include: [{
       model: Tabs,
       required: true
     }]
    });

    let tabs = []

    usersByRoom.tabs.forEach(tab => {
      tabs.push(tab.tabid)
    })

    let usersInRoom = await Users.findAll({
      include: [{
        model: Tabs,
        where: {
          tabid: tabs
        }
      }]
    })
    
    let isUserInRoom = usersInRoom.find(item => item.userid === user.userid);
    if(isUserInRoom.tabs.length === 1) {
      socket.emit('messages/new', m('admin', `Welcome, ${user.username}`));
      await buildNewRecord(roomId, null, {name: 'admin', text: `Welcome, ${user.username}`});
      
      socket.broadcast.to(roomId).emit('messages/new', m('admin', `User ${user.username} joined`));
      await buildNewRecord(roomId, null, {name: 'admin', text: `User ${user.username} joined`})
    }

    io.to(roomId).emit("users/update", usersInRoom);

  })

  socket.on('disconnect', async (data) => {
    console.log("correct disconnection")

    let user = socket.user;
    let tab = await Tabs.findOne({
      where: {
        tabid: socket.handshake.query.tabId
      }
    })

    let room = await Rooms.findOne({
      include: [{
        model: Tabs,
        required: true,
        where: {
          tabid: socket.handshake.query.tabId
        }
      }]
    })

    await tab.destroy();

    let tabRoom = await Tabs.findOne({
      where: {
        roomid: room.roomid,
        tabid: socket.handshake.query.tabId
      }
    })

    await tabRoom.destroy();

    let usersByRoom = await Rooms.findOne({
      where: {
        roomid: room.roomid
      },
      include: [{
        model: Tabs,
        required: true
      }]
    });

    if(usersByRoom) {
      let tabs = []


      usersByRoom.tabs.forEach(tab => {
        tabs.push(tab.tabid)
      })

      let usersInRoom = await Users.findAll({
        include: [{
          model: Tabs,
          where: {
            tabid: tabs
          }
        }]
      })

      let isUserInRoom = usersInRoom.find(item => item.userid === user.userid);

      if(usersInRoom.length === 0) {
        let roomTmp = await Rooms.findOne({
          where: {
            roomid: room.roomid
          }
        })
        await roomTmp.destroy();
      }

      if(!isUserInRoom) {
        io.to(room.roomid).emit("users/update", usersInRoom);
        io.to(room.roomid).emit("messages/new", m("admin", `User ${user.username} left`))
        await buildNewRecord(room.roomid, null, {name: 'admin', text: `User ${user.username} left`})
      }
    }
    else {
      let roomTmp = await Rooms.findOne({
        where: {
          roomid: room.roomid
        }
      })
      await roomTmp.destroy();
    }
    let createdRooms = await Rooms.findAll();
    io.emit("rooms/getAll", createdRooms);
    console.log(123)
  })

  socket.on("createMessage", async (data, callback) => {

    if (!data) {
      return callback('Incorrect data');
    }
    let userInfo = socket.user
    let room = await Rooms.findOne({
      include: [{
        model: Tabs,
        required: true,
        where: {
          tabid: socket.handshake.query.tabId
        }
      }]
    });

    if (room) {
      io.to(room.roomid).emit('messages/new', m(userInfo.username, data.message, userInfo.userid))

      await buildNewRecord(room.roomid, userInfo.userid, {
        name: `${userInfo.username}`,
        text: `${data.message}`
      })
    }
    callback();
  })
});

httpServer.listen(8080, () => {
  console.log("Server has started on 8080 port")
});
