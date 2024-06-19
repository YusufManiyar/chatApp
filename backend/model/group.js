const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js');
const User = require('./user.js')

const Group = sequelize.define('Group', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    },
});

module.exports = Group