const {Sequelize, DataTypes} = require('sequelize');
const db = require('../config/database');

const UsersTmp = db.define('usersmain', {
    id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    roomId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    socketId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    createdAt   : 'createdat',
    updatedAt   : 'updatedat',
    timestamps: true,
    tableName: 'usersmain',
  })

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
