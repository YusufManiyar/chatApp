const WebSocket = require('ws');
const Message = require('../model/message.js')

module.exports = {
    addMessage: async (wss, ws, body) => {
        const { receiverId, message } = JSON.parse(body);
        const user = ws.user;
        const senderId = user.id;
        try {
            const newMessage = await Message.create({ senderId, receiverId, message });

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client.user.groups.includes(receiverId)) {
                    client.send(JSON.stringify(newMessage));
                }
            });
        } catch (error) {
            throw error
        }

    }
}