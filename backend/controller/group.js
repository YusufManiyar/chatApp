const Group = require('../model/group.js')
const { Op } = require('sequelize');
const GroupMember = require('../model/groupMembers.js');
const User = require('../model/user.js');

module.exports = {
    addGroup: async (req, res) => {
        const { name, memberIds } = req.body;
        const user = req.user;
        const createdBy = user.id;
        memberIds.push(user.id)
        try {
            const newGroup = await Group.create({ name, createdBy });


           if (memberIds && memberIds.length > 0) {
                const groupMembers = memberIds.map(memberId => ({
                    memberId,
                    groupId: newGroup.id,
                }));
                await GroupMember.bulkCreate(groupMembers);
            }
            res.status(201).json(newGroup);
        } catch (error) {
            res.status(500).json({ error: 'Failed to send Group' });
        }
    },  
    
    getGroup: async(req, res) => {
        try {
            const user = req.user

            const group = await GroupMember.findAll({
                where: {
                    memberId: user.id
                },
                include: [
                    {
                        model: Group,
                        as: 'group',
                    },
                    {
                        model: User,
                        as: 'user',
                    }
                ]
            })

            console.log(group)
            res.status(200).json(group);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
}