const {Sequelize, DataTypes} = require('sequelize');
const db = require('../config/database');
const Rooms = require('../models/Rooms');
const UsersTmpRooms = require('../models/UsersTmpRooms');

const UsersTmp = db.define('userstmp', {
    // id: {
    //   type: DataTypes.UUID,
    //   autoIncrement: true,
    //   primaryKey: true,
    //   allowNull: false
    // },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    roomid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    socketid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    }
  },
  {
    createdAt   : 'createdat',
    updatedAt   : 'updatedat',
    timestamps: true,
    tableName: 'userstmp',
  })


UsersTmp.belongsToMany(Rooms, {
  through: UsersTmpRooms,
  as: 'rooms',
  foreignKey: 'token',
  otherKey: 'roomid'
});

Rooms.belongsToMany(UsersTmp, {
  through: UsersTmpRooms,
  as: 'userstmp',
  foreignKey: 'roomid',
  otherKey: 'token'
});


// History.buildNewRecord = function (roomid, userid, history) {
//   return this.build({
//     roomid,
//     userid,
//     history
//   });
// }
//
// History.getHistoryByRoomId = function (roomid) {
//   return this.findOne({
//     where: {
//       roomid
//     }
//   })
// }
//
// History.buildNewHistory = (roomid, history) => {
//   return this.build({
//     roomid,
//     history
//   })
// }

module.exports = UsersTmp;
