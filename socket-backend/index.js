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
const socketMap = require('./common/map');
const createObjectFromMessage = require('./helpers/createObjectFromMessage')

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

let tabsForHistory = [];

const io = require("socket.io")(httpServer, {
  cors: {
    origin: '*',
  }
});


// const m = (name, text, id) => ({name, text, id})

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
  let decoded = null
  try {
    decoded = jwt.verify(socket.handshake.query.loggeduser.split(' ')[1], keys.jwt);
  } catch (e) {
    console.log('Invalid token', e)
  }

  if (!decoded) return;
  let user = await Users.getUserByUserId(decoded.userId);
  if (!user) return;
  console.log("[SOCKET_ID]", socket.id);

  // chatHandlers(socket)
  // roomHandlers(socket)
  // adminHandlers(socket)
  // chatHandlers(socket)
  // chatHandlers(socket)
  // chatHandlers(socket)

  // socket.user = user;
  socketMap[socket.handshake.query.tabId] = socket;

  let tab = await Tabs.getTabById(socket.handshake.query.tabId);

  if (!tab) {
    tab = await user.createTab({tabid: socket.handshake.query.tabId});
  }

  socket.user = user;
  console.log("correct connection")

  socket.on("users/left", async (callback) => {
    let user = socket.user;
    await exitFromRoom(tab, user);

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

    let room = await Rooms.findOne({
      where: {
        roomid: roomId
      }
    })

    if (!room) {
      let newRoom = Rooms.build({
        roomid: roomId,
        roomname: data.room.name
      })
      await newRoom.save();

      room = newRoom
    }

    await room.createTab({tabid: socket.handshake.query.tabId});

    let roomWithTabs = await Rooms.findOne({
      where: {
        roomid: roomId
      },
      include: [{
        model: Tabs,
        required: true
      }]
    });

    let tabs = roomWithTabs.tabs.filter(t => t.tabid !== tab.tabid).map((t) => t.tabid)

    let usersInRoom = await Users.getUsersIncludeTabs(tabs);
    let isUserInRoom = usersInRoom.find(item => item.userid == user.userid);

    if (isUserInRoom) {
      for (let i = 0; i < roomWithTabs.tabs.length; i++) {
        const socket = socketMap[roomWithTabs.tabs[i].tabid]
        socket.emit("users/update", usersInRoom.map((u) => ({
          userid: u.userid,
          username: u.username
        })));
      }
      socket.emit('messages/new', false);
      return
    }
    usersInRoom.push(user)

    let createdRooms = await Rooms.findAll();

    // let res = createObjectFromMessage('admin', `Welcome, ${user.username}`)
    socket.emit('messages/new', createObjectFromMessage('admin', `Welcome, ${user.username}`));

    const message = createObjectFromMessage('admin', `${user.username} joined`)
    await buildNewRecord(roomId, null, message);

    io.emit("rooms/getAll", createdRooms);

    for (let i = 0; i < roomWithTabs.tabs.length; i++) {
      const socket = socketMap[roomWithTabs.tabs[i].tabid]
      socket.emit("users/update", usersInRoom.map((u) => ({
        userid: u.userid,
        username: u.username
      })));
    }

    for (let i = 0; i < tabs.length; i++) {
      const socket = socketMap[tabs[i]]
      socket.emit('messages/new', message);
    }
  })

  // socket.on('disconnect', async (data) => {
  //   console.log("correct disconnection")
  //
  //   let tabsByTabId = await Tabs.findAll({
  //     where: {
  //       tabid: tab.tabid
  //     }
  //   })
  //
  //   let isInRoom = tabsByTabId.find(item => item.roomid)
  //
  //   if (!isInRoom) {
  //     return;
  //   }
  //   let sameTab = tabsForHistory.find(tab => tab.userid === socket.user.userid)
  //   if (sameTab) {
  //     tabsForHistory = [];
  //     return;
  //   }
  //
  //   tabsForHistory.push(tab);
  //   let user = socket.user;
  //   await exitFromRoom(tab, user)
  //   delete socketMap[socket.handshake.query.tabId];
  // })

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
    })

    if (room) {
      let usersByRoom = await Rooms.findOne({
        where: {
          roomid: room.roomid
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

      let sockets = tabs.map(tab => {
        return socketMap[tab];
      })

      for (let i = 0; i < sockets.length; i++) {
        sockets[i].emit('messages/new', createObjectFromMessage(userInfo.username, data.message, userInfo.userid));
      }

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
