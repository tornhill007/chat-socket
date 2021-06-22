const {Sequelize, DataTypes} = require('sequelize');
const db = require('../config/database');


const History = db.define('historytmp', {
    id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    roomid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userid: {
      type: DataTypes.INTEGER,
    },
    history: {
      type: DataTypes.JSON,
      allowNull: false
    },
  },
  {
    createdAt   : 'createdat',
    updatedAt   : 'updatedat',
    timestamps: true,
    tableName: 'historytmp',
  })

History.getHistoryByRoomId = function (roomid) {
  return this.findOne({
    where: {
      roomid
    }
  })
}

History.buildNewHistory = (roomid, history) => {
  return this.build({
    roomid,
    history
  })
}


module.exports = History;
