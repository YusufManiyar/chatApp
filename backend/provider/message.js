const WebSocket = require('ws');
const Message = require('../model/message.js')

module.exports = {
    addMessage: async (wss, ws, body) => {
        const { receiverId, message } = JSON.parse(body);
        const user = ws.user;
        const senderId = user.id;
        try {
            const newMessage = await Message.create({ senderId, receiverId, message });

            console.log(newMessage, wss.clients)
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client.user.groups.includes(receiverId)) {


                    client.send(JSON.stringify({
                        type: 'newMessage',
                        ...newMessage
                    }));
                }
            });
        } catch (error) {
            throw error
        }

    }
}