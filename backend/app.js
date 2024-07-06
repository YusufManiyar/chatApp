const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const userRoutes = require('./routes/user.js');
const messageRoutes = require('./routes/message.js');
const groupRoutes = require('./routes/group.js');
const cors = require('cors');
const groupMemberRoutes = require('./routes/groupMember.js');
const { verifyTokenSocket } = require('./middleware/autho.js')
const { addMessage } = require('./provider/message.js')
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 4000;

// Middleware and routes setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
    origin: process.env.CHATMET_FRONTEND_URL
}));

// Routes setup
app.use('/user', userRoutes);
app.use('/message', messageRoutes);
app.use('/group', groupRoutes);
app.use('/groupMember', groupMemberRoutes);


    // Create an HTTP server for Express
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', (ws, req) => {
        // Extract token from URL query string
        const token = req.url.split('token=')[1];

        if (!token) {
            ws.close();
            return;
        }

        // Verify token and get user details
        verifyTokenSocket(token, async (err, user) => {
            if (err) {
                ws.close();
                return;
            }

            // Attach user details to WebSocket connection
            ws.user = user

            // Handle incoming messages
            ws.on('message', async (message) => await addMessage(wss, ws, message))
        });
});



sequelize.sync({ focus: true }).then(() => {
    console.log('Database synced');
});

module.exports = app;
