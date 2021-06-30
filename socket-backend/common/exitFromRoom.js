const History = require('../models/History');
const ConnectedUsers = require('../models/ConnectedUsers');
const UsersTmp = require('../models/UsersTmp');
const Tabs = require('../models/Tabs');
const UsersMain = require('../models/UsersMain');
const Rooms = require('../models/Rooms');
const Users = require('../models/Users');
const buildNewRecord = require('./buildNewRecord');
const socketMap = require('./map')
const createObjectFromMessage = require('../helpers/createObjectFromMessage')

// const emitNewMessage = async (io, m, user) => {
//
//   let usersInRoom = await UsersMain.findAll({
//     where: {
//       roomid: user.roomid
//     }
//   })
//   io.to(user.roomid).emit("users/update", usersInRoom);
//   io.to(user.roomid).emit("messages/new", m("admin", `User ${user.username} left`))
//
//   await buildNewRecord(user.roomid, null, {name: 'admin', text: `User ${user.username} left`})
// }

const exitFromRoom = async (tab, user) => {

  // const user = await Users.findUserByUserId(user.userid)
  let room = await Rooms.findOne({
    include: [{
      model: Tabs,
      required: true,
      where: {
        tabid: tab.tabid
      }
    }]
  })

  await Tabs.destroy({
    where: {
      roomid: room.roomid,
      tabid: tab.tabid
    }
  })

  if (!room) return;

  let roomWithTabs = await Rooms.findOne({
    where: {
      roomid: room.roomid
    },
    include: [{
      model: Tabs,
      required: true
    }]
  });
  if (!roomWithTabs) {
    await room.destroy();
    await History.destroy({
      where: {
        roomid: room.roomid
      }
    })
    let createdRooms = await Rooms.findAll();
    for(let key in socketMap) {
      socketMap[key].emit("rooms/getAll", createdRooms)
    }
    return;
  }

  let tabs = roomWithTabs.tabs.map((t) => t.tabid)
  let usersInRoom = await Users.getUsersIncludeTabs(tabs);
  // if (usersInRoom.length === 0) {
  //   await room.destroy();
  //   return;
  // }
  let isUserInRoom = usersInRoom.find(item => item.userid == tab.userid);
  if (isUserInRoom) return;


  const message = createObjectFromMessage('admin', `User ${user.username} left`)
  await buildNewRecord(room.roomid, null, message);

  // io.emit("rooms/getAll", createdRooms);
  // io.emit("rooms/getAll", createdRooms);

  for (let i = 0; i < tabs.length; i++) {
    const socket = socketMap[tabs[i]]
    socket.emit('messages/new', message);

    socket.emit("users/update", usersInRoom.map((u) => ( {
      userid: u.userid,
      username: u.username
    })));
  }
}

module.exports = exitFromRoom;