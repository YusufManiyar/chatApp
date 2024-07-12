const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js');
const User = require('./user.js');
const Group = require('./group.js');

const ArchivedChat = sequelize.define('ArchivedChat', {
    attachment: {
        type: DataTypes.TEXT
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    receiverId: {
        type: DataTypes.INTEGER,
        references: {
            model: Group,
            key: 'id'
        }
    },
});

module.exports = ArchivedChat;
