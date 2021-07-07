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

const exitFromRoom = async (tab, user) => {

  await Tabs.destroy({
    where: {
      tabid: tab.tabid,
      userid: user.userid
    }
  });

  let room = await Rooms.findOne({
    include: [{
      model: Tabs,
      required: true,
      where: {
        tabid: tab.tabid
      }
    }]
  })

  if (!room) return;

  await Tabs.destroy({
    where: {
      roomid: room.roomid,
      tabid: tab.tabid
    }
  })



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
  let isUserInRoom = usersInRoom.find(item => item.userid == tab.userid);
  if (isUserInRoom) return;

  const message = createObjectFromMessage('admin', `User ${user.username} left`)
  await buildNewRecord(room.roomid, null, message);

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