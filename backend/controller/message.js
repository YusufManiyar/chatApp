const Message = require('../model/message.js')
const { Op } = require('sequelize')

module.exports = {
    addMessage: async (req, res) => {
        const { receiverId, message } = req.body;
        const user = req.user;
        const senderId = user.id;
        try {
            const newMessage = await Message.create({ senderId, receiverId, message });
            // io.emit('receiveMessage', { message: newMessage.message, from: senderId, to: receiverId });
            res.status(201).json(newMessage);
        } catch (error) {
            res.status(500).json({ error: 'Failed to send message' });
        }
    },  

    getMessage: async(req, res) => {
        try {

            const user = req.user
            const query = req.query
            const groupId = query.id

            const matchParams = {
                receiverId: groupId
            }

            const messages = await Message.findAll({
                where: matchParams,
                order: [['id', 'ASC']]
            });

            res.status(200).json(messages);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
}