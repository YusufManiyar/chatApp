const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());

// MySQL connection using Sequelize
const sequelize = new Sequelize('chatAppDB', 'root', '', {
    host: 'localhost',
    port: '3306',
    dialect: 'mysql'
});

// Define User model
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phoneNo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

// Synchronize models with database
sequelize.sync()
    .then(() => console.log('Database & tables created!'))
    .catch(err => console.log(err));

// Sign-up route
app.post('/signup', async (req, res) => {
    const { username, email, phoneNo, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = await User.create({
            username,
            email,
            phoneNo,
            password: hashedPassword
        });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Start the server

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });

