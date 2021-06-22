const History = require('../models/History')
const buildNewRecord = require('./buildNewRecord')

const emitNewMessage = async (io, m, user, usersInstance) => {
  io.to(user.room).emit("users/update", usersInstance.getByRoom(user.room));
  io.to(user.room).emit("messages/new", m("admin", `User ${user.name} left`))

  await buildNewRecord(user.room, null, {name: 'admin', text: `User ${user.name} left`})
}

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
        await emitNewMessage(io, m, removedUser, usersInstance);

      } else if (!isUserInRoom) {
        usersInstance.remove(result.id, result.socketId);
        await emitNewMessage(io, m, result, usersInstance);
      }
    } else {
      await emitNewMessage(io, m, removedUser, usersInstance);

      roomsInstance.removeByRoomId(removedUser.room);

      let tmp = usersTmpInstance.getByRoom(removedUser.room)
      if (!tmp || tmp.length === 0) {

        let createdRooms = roomsInstance.getAll();
        io.emit("rooms/getAll", createdRooms);
        let history = await History.destroy({
          where: {
            roomid: removedUser.room
          }
        });
      }
    }
  }
}

module.exports = exitFromRoom;