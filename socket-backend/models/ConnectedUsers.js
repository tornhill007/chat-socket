const {Sequelize, DataTypes} = require('sequelize');
const db = require('../config/database');

const ConnectedUsers = db.define('connectedusers', {
    id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    socketid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userid: {
      type: DataTypes.INTEGER,
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
    tableName: 'connectedusers',
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

module.exports = ConnectedUsers;
