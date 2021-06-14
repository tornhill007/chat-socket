const {Sequelize, DataTypes} = require('sequelize');
const db = require('../config/database');


const History = db.define('history', {
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
        history: {
            type: DataTypes.JSON,
            allowNull: false
        },
    },
    {
        timestamps: false,
        tableName: 'history',

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
