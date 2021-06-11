const { Sequelize } = require('sequelize');

module.exports = new Sequelize('minesweeper', 'andrewkomar', '12345', {
    host: 'localhost',
    dialect: 'postgres',
    define: {
        timestamps: false
    },
});
