const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Group = require('./group');

const Message = sequelize.define('Message', {
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

Message.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
Message.belongsTo(Group, { as: 'Receiver', foreignKey: 'receiverId' });

module.exports = Message;
