const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js');
const User = require('./user.js');
const Group = require('./group.js');

const ArchiveChat = sequelize.define('ArchiveChat', {
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

ArchiveChat.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
ArchiveChat.belongsTo(Group, { as: 'Receiver', foreignKey: 'receiverId' });

module.exports = ArchiveChat;
