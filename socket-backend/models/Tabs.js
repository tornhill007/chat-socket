const {Sequelize, DataTypes} = require('sequelize');
const db = require('../config/database');
const Rooms = require('../models/Rooms');

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

const Tabs = db.define('tabs', {
    id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    tabid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userid: {
      type: DataTypes.UUID,
    },
    roomid: {
      type: DataTypes.STRING,
    }
  },
  {
    createdAt: 'createdat',
    updatedAt: 'updatedat',
    timestamps: true,
    tableName: 'tabs',
  })

Tabs.getTabById = function (tabid) {
  return this.findOne({
    where: {
      tabid
    }
  });
}


module.exports = Tabs;
