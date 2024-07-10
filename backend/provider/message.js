const WebSocket = require('ws');
const Message = require('../model/message.js')
const { uploadFile } = require('./fileSystem.js')

module.exports = {
    addMessage: async (wss, ws, body) => {
        const { receiverId, message, attachment } = JSON.parse(body);
        const user = ws.user;
        const senderId = user.id;
        try {
            let fileUrl
            if(attachment) {
                //write code to upload file to cloud and get the url
                fileUrl = await uploadFile(attachment)
            }

            const newMessage = await Message.create({ senderId, receiverId, message, attachment: fileUrl });

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