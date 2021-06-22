const usersInstance = require('../store')();
const usersTmpInstance = require('../store')();
const roomsInstance = require('../store')();
const connectedUsersInstance = require('../store')();
const History = require('../models/History')

const exitFromRoom = async (socketId, io, m, usersTmpInstance, usersInstance, connectedUsersInstance, roomsInstance) => {
  const connectedUser = connectedUsersInstance.getBySocketId(socketId);
  if (connectedUser) {

    let removedConnectedUser = connectedUsersInstance.removeConnectedUserById(socketId)
    let removedUser = usersTmpInstance.remove(removedConnectedUser.userId, removedConnectedUser.socketId);
    let usersInRoom = usersTmpInstance.getByRoom(removedUser.room);
    let isUserInRoom = usersInRoom.find(item => item.id === removedUser.id);

    if (usersInRoom.length !== 0) {
      let currentUserInRoom = usersInstance.getByRoom(removedUser.room);
      let result = currentUserInRoom.find(item => item.id === removedUser.id);
      if (!result) {
        usersInstance.remove(removedUser.id, removedUser.socketId);
        io.to(removedUser.room).emit("users/update", usersInstance.getByRoom(removedUser.room));
        io.to(removedUser.room).emit("messages/new", m("admin", `User ${removedUser.name} left`))
        let newRecord = History.build({
          roomid: removedUser.room,
          history: {name: 'admin', text: `User ${removedUser.name} left`}
        })
        // let history = await History.findOne({
        //   where: {
        //     roomid: removedUser.room
        //   }
        // });
        // const cloneHistory = JSON.parse(JSON.stringify(history.history));
        // cloneHistory.push({name: 'admin', text: `User ${removedUser.name} left`});
        // history.history = cloneHistory;
        await newRecord.save();

      } else if (!isUserInRoom) {
        usersInstance.remove(result.id, result.socketId);
        io.to(result.room).emit("users/update", usersInstance.getByRoom(result.room));
        io.to(result.room).emit("messages/new", m("admin", `User ${result.name} left`))
        // let history = await History.findOne({
        //   where: {
        //     roomid: result.room
        //   }
        // });

        let newRecord = History.build({
          roomid: result.room,
          history: {name: 'admin', text: `User ${result.name} left`}
        })

        // const cloneHistory = JSON.parse(JSON.stringify(history.history));
        // cloneHistory.push({name: 'admin', text: `User ${result.name} left`});
        // history.history = cloneHistory;
        await newRecord.save();
      }
    } else {
      io.to(removedUser.room).emit("users/update", usersInstance.getByRoom(removedUser.room));
      io.to(removedUser.room).emit("messages/new", m("admin", `User ${removedUser.name} left`))
      let newRecord = History.build({
        roomid: removedUser.room,
        history: {name: 'admin', text: `User ${removedUser.name} left`}
      })
      // let history = await History.findOne({
      //   where: {
      //     roomid: removedUser.room
      //   }
      // });
      // const cloneHistory = JSON.parse(JSON.stringify(history.history));
      // cloneHistory.push({name: 'admin', text: `User ${removedUser.name} left`});
      // history.history = cloneHistory;
      await newRecord.save();

      roomsInstance.removeByRoomId(removedUser.room);

      let userInRoom = usersInstance.getByRoom(removedUser.room);
      let tmp = usersTmpInstance.getByRoom(removedUser.room)
      if (!tmp || tmp.length === 0) {

        let createdRooms = roomsInstance.getAll();
        io.emit("rooms/getAll", createdRooms);
        // let history = await History.findOne({
        //   where: {
        //     roomid: removedUser.room
        //   }
        // });
        // await history.destroy();
      }
    }
  }
}

module.exports = exitFromRoom;