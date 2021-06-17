const {Sequelize, DataTypes} = require('sequelize');
const db = require('../config/database');


const Users = db.define('users', {
    userid: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
  },
  {
    timestamps: false,
    tableName: 'users',

  })

Users.findUsersByUserName = function (username) {
  return this.findAll({where: {username}});
}

Users.findUserByUserId = function (userid) {
  return this.findOne({where: {userid}});
}

Users.buildNewUser = function (username, password) {
  return this.build({
    username,
    password
  });
}

Users.getUserByUserId = function (userid) {
  return this.findOne({
    where: {
      userid
    }
  });
}


module.exports = Users;
