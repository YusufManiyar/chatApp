const Message = require('../model/message.js')

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
}