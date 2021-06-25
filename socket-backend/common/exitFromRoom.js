const History = require('../models/History');
const ConnectedUsers = require('../models/ConnectedUsers');
const UsersTmp = require('../models/UsersTmp');
const UsersMain = require('../models/UsersMain');
const Rooms = require('../models/Rooms');
const buildNewRecord = require('./buildNewRecord');

const emitNewMessage = async (io, m, user) => {

  let usersInRoom = await UsersMain.findAll({
    where: {
      roomid: user.roomid
    }
  })
  io.to(user.roomid).emit("users/update", usersInRoom);
  io.to(user.roomid).emit("messages/new", m("admin", `User ${user.username} left`))

  await buildNewRecord(user.roomid, null, {name: 'admin', text: `User ${user.username} left`})
}

const exitFromRoom = async (socketId, io, m) => {
  // const connectedUser = connectedUsersInstance.getBySocketId(socketId);
  const connectedUser = await ConnectedUsers.findOne({
    where: {
      socketid: socketId
    }
  })
  if (connectedUser) {

    // let removedConnectedUser = connectedUsersInstance.removeConnectedUserById(socketId);

    let removedConnectedUser = ConnectedUsers.destroy({
      where: {
        socketid: socketId
      }
    })

    // let removedUser = usersTmpInstance.remove(connectedUser.userId, removedConnectedUser.socketId);
    let removedUser = await UsersTmp.findOne({
      where: {
        userid: connectedUser.userid,
        socketid: connectedUser.socketid
      }
    })

    let room = await Rooms.findOne({
      where: {
        roomid: removedUser.roomid
      }
    })

    // removedUser.removeRoom(room);

    await removedUser.destroy();
      // usersTmpInstance.remove(connectedUser.userId, removedConnectedUser.socketId);


    // let usersInRoom = usersTmpInstance.getByRoom(removedUser.room);

    let usersInRoom = await UsersTmp.findAll({
      where: {
        roomid: removedUser.roomid
      }
    });

    let isUserInRoom = usersInRoom.find(item => item.userid === removedUser.userid);

    if (usersInRoom.length !== 0) {

      // let currentUserInRoom = usersInstance.getByRoom(removedUser.room);
      let currentUserInRoom = await UsersMain.findAll({
        where: {
          roomid: removedUser.roomid
        }
      });

      let result = currentUserInRoom.find(item => item.userid === removedUser.userid);
      if (!result) {
        let removedUserMain = await UsersMain.findOne({
          where: {
            userid: removedUser.userid,
            socketid: removedUser.socketid
          }
        })

        await removedUserMain.destroy();
        // usersInstance.remove(removedUser.id, removedUser.socketId);

        await emitNewMessage(io, m, removedUser);

      } else if (!isUserInRoom) {
        let removedUserMain = await UsersMain.findOne({
          where: {
            userid: result.userid,
            socketid: result.socketid
          }
        })

        await removedUserMain.destroy();
        // usersInstance.remove(result.id, result.socketId);
        await emitNewMessage(io, m, result);
      }
    } else {

      let removedUserMain = await UsersMain.findOne({
        where: {
          userid: removedUser.userid,
          socketid: removedUser.socketid
        }
      })

      await removedUserMain.destroy();

      await emitNewMessage(io, m, removedUser);

      let removedRoom = await Rooms.destroy({
        where: {
          roomid: removedUser.roomid
        }
      })
      // roomsInstance.removeByRoomId(removedUser.room);

      // let tmp = usersTmpInstance.getByRoom(removedUser.room)
      let tmp = await UsersTmp.findAll({
        where: {
          roomid: removedUser.roomid
        }
      })
      if (!tmp || tmp.length === 0) {

        // let createdRooms = roomsInstance.getAll();
        let createdRooms = await Rooms.findAll();
        io.emit("rooms/getAll", createdRooms);
        let history = await History.destroy({
          where: {
            roomid: removedUser.roomid
          }
        });
      }
    }
  }
}

module.exports = exitFromRoom;