const {Sequelize, DataTypes} = require('sequelize');
const db = require('../config/database');


const DisconnectTime = db.define('disconnect_time', {
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
  },
  {
    createdAt   : 'createdat',
    updatedAt   : 'updatedat',
    timestamps: true,
    tableName: 'disconnect_time',
  })


module.exports = DisconnectTime;
