const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const userRoutes = require('./routes/user.js');
const messageRoutes = require('./routes/message.js')
const groupRoutes = require('./routes/group.js')
const cors = require('cors');
const groupMemberRoutes = require('./routes/groupMember.js');

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({extended: false}))
// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));

// Routes
app.use('/user', userRoutes);
app.use('/message', messageRoutes);
app.use('/group', groupRoutes)
app.use('/groupMember', groupMemberRoutes)

sequelize.sync({focus: true}).then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
  });
