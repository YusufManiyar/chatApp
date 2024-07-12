const WebSocket = require('ws');
const Message = require('../model/message.js')
const { uploadFile } = require('./fileSystem.js')

module.exports = {
    addMessage: async (wss, ws, body) => {
        console.log('body==>\n\n',  body, '\n\n')
        const buffer = Buffer.from(body);

        // Parse the JSON part first
        const jsonPartEndIndex = buffer.indexOf('}') + 1;
        const jsonPart = buffer.slice(0, jsonPartEndIndex).toString();
        const data = JSON.parse(jsonPart);
        const fileBuffer = buffer.slice(jsonPartEndIndex);
    
        const user = ws.user;
        const senderId = user.id;
        try {
            let fileUrl
            if(data.hasFile) {
                //write code to upload file to cloud and get the url
                console.log(fileBuffer,'c=>c attachment')
                fileUrl = await uploadFile(fileBuffer)
            }
            delete data.hasFile
            console.log('data=>\n', { senderId, ...data, attachment: fileUrl })
            const newMessage = await Message.create({ senderId, ...data, attachment: fileUrl });

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client.user.groups.includes(data.receiverId)) {
                    client.send(JSON.stringify(newMessage));
                }
            });
        } catch (error) {
            throw error
        }

    }
}