const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Group = require('./group')

const GroupMember = sequelize.define('groupMember', {
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Group,
            key: 'id'
        }
    },
    memberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
});

GroupMember.belongsTo(Group, { as: 'group', foreignKey: 'groupId' });
GroupMember.belongsTo(User, { as: 'user', foreignKey: 'memberId' });

module.exports = GroupMember;