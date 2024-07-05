const { Sequelize } = require('sequelize');

const sequelize = new Sequelize( process.env.DB_NAME || 'chatAppDB', process.env.DB_USERNAME || 'root',process.env.DB_PASSWORD || '', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '3306' ,
    dialect: 'mysql'
});

module.exports = sequelize;
