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
            console.log('reqqq',req.query)
            const user = req.user
            const query = req.query
            const peer = query.id
            const skip = query.skip
            const limit = query.limit || 10

            const matchParams = {
                [Op.or]: [
                    { senderId: user.id, receiverId: peer },
                    { senderId: peer, receiverId: user.id }
                ],
            }

            if(skip) {
                matchParams.id = {
                    [Op.gt]: skip
                }
            }

            const messages = await Message.findAll({
                where: matchParams,
                order: [['id', 'ASC']],
                limit: Number(limit)
            });

            res.status(200).json(messages);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
}