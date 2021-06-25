const {Sequelize, DataTypes} = require('sequelize');
const db = require('../config/database');

const UsersTmpRooms = db.define('userstmprooms', {
    id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roomid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'userstmprooms'
  })

// UsersProjects.buildUsersProject = function (projectid, userid) {
//   return this.build({projectid, userid});
// }
//
// UsersProjects.destroyUsersProjectsByProjectId = function (projectid) {
//   return this.destroy({where: { projectid }});
// }
//
//
//
// UsersProjects.getAllUsersProjectsByProjectId = function (projectid) {
//   return this.findAll({where: { projectid }});
// }


module.exports = UsersTmpRooms;