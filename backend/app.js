const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const userRoutes = require('./routes/user.js');
const cors = require('cors')

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));

// Routes
app.use('/chatApp', userRoutes);

// Test database connection and sync models
// sequelize.authenticate()
//     .then(() => {
//         console.log('Database connected...');
//         return sequelize.sync();
//     })
//     .then(() => console.log('Database & tables created!'))
//     .catch(err => console.log('Error: ' + err));

// Start the server
sequelize.sync({focus: true}).then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
  });
