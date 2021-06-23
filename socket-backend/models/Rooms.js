const {Sequelize, DataTypes} = require('sequelize');
const db = require('../config/database');

// CREATE TABLE rooms (
//   id serial NOT NULL PRIMARY KEY,
//   roomName VARCHAR(255) NOT NULL,
//   roomId NUMERIC NOT NULL,
//   createdAt timestamp NOT NULL,
//   updatedat timestamp NOT NULL
// );

const Rooms = db.define('rooms', {
    id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    roomName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    createdAt   : 'createdat',
    updatedAt   : 'updatedat',
    timestamps: true,
    tableName: 'rooms',
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

module.exports = Rooms;
