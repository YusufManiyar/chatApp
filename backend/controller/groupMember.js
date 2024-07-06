
const GroupMember = require('../model/groupMembers.js');
const User = require('../model/user.js');
const { Op, where } = require('sequelize');
const message = require('./message.js');

module.exports = {
    
    getGroupMember: async(req, res) => {
        const query = req.query
        const groupId = query.id
        try {
        const groupMembers = await GroupMember.findAll({
            where: { groupId },
            include: [{ 
                model: User, 
                as: 'user',
                attributes: {exclude: ['password']}
            }]
        });
        res.json(groupMembers);
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    },

    addGroupMember: async(req, res) => {
        const { groupId, memberId } = req.body;
        try {
            await GroupMember.create({groupId, memberId, role: 'user' });
            res.status(201).json({message: 'added Successfully'});
        } catch (error) {
            res.status(500).json({ message : error.toString()});
        }
    },

    deleteGroupMember: async (req, res) => {
        try{
            const query = req.query
            const id = query.id
            const member = await GroupMember.findByPk(id)
            const totalAdmins = await GroupMember.count({where: {
                groupId: member.groupId,
                role: 'admin'
            }})

            if(totalAdmins <= 1 && member.role === 'admin'){
                throw 'admin cant leave this group'
            }

            await member.destroy()

            res.status(200).json({message: 'delete successfully'})
        } catch (error) {
            console.log(error)
            res.status(500).json({message: error.toString() });
        }
    },

    putGroupMember: async(req, res) => {
        try{
            const query = req.query
            const id = query.id
    
            await GroupMember.update({role: 'admin'},{
                where: {id}
            })
    
            res.status(200).json({message: 'update Successfully'})
        } catch(error){
            console.log(error)
            res.status(500).json({message: error.toString() })
        }
    }
}