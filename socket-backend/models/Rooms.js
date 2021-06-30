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


Rooms.getRoomIncludeTabs = (tabid) => {
  return this.findOne({
    include: [{
      model: Tabs,
      required: true,
      where: {
        tabid
      }
    }]
  })
}

Rooms.buildNewRoom = (roomid, roomname) => {
  return this.build({
    roomid,
    roomname
  })
}

Rooms.getRoomById = (roomid) => {
  return this.findOne({
    where: {
      roomid
    }
  })
}

Rooms.getRoomByIdIncludeTabs = (roomid) => {
  return this.findOne({
    where: {
      roomid
    },
    include: [{
      model: Tabs,
      required: true
    }]
  });
}

Rooms.hasMany(Tabs, {foreignKey: 'roomid', onDelete: "cascade" });

module.exports = Rooms;
