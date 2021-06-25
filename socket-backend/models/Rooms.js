const {Sequelize, DataTypes} = require('sequelize');
const db = require('../config/database');
const Tabs = require('../models/Tabs');

// CREATE TABLE rooms (
//   id serial NOT NULL PRIMARY KEY,
//   roomName VARCHAR(255) NOT NULL,
//   roomId NUMERIC NOT NULL,
//   createdAt timestamp NOT NULL,
//   updatedat timestamp NOT NULL
// );

//
// roomid: {
//   type: DataTypes.STRING,
//     primaryKey: true,
//     allowNull: false
// },
// roomname: {
//   type: DataTypes.STRING,
//     allowNull: false
// },

const Rooms = db.define('rooms', {
    roomid: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    roomname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // id: {
    //   type: DataTypes.UUID,
    //   autoIncrement: true,
    //   primaryKey: true,
    //   allowNull: false
    // },
    // roomname: {
    //   type: DataTypes.STRING,
    //   allowNull: false
    // },
    // roomid: {
    //   type: DataTypes.STRING,
    //   allowNull: false
    // }
  },
  {
    createdAt   : 'createdat',
    updatedAt   : 'updatedat',
    timestamps: true,
    tableName: 'rooms',
  })


Rooms.hasMany(Tabs, {foreignKey: 'roomid', onDelete: "cascade" });

// Rooms.hasMany(Tabs, {as: 'tabs'});
// Tabs.belongsTo(Rooms, {foreignKey: 'roomid', as: 'rooms', onDelete: "cascade" })

// Tabs.hasOne(Rooms, {foreignKey: 'tabid', onDelete: "cascade" });
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
