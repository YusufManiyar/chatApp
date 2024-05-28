const bcrypt = require('bcryptjs');
const User = require('../model/user.js');
const {Op} = require('sequelize')


module.exports = { 
    signUp:  async (req, res) => {
        const { username, email, phone, password } = req.body;
    
        try {
            // Check if the user already exists
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [
                        { email: email },
                        { phone: phone }
                    ]
                }
            });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }
    
            // Check if the phone number already exists
            // const existingPhone = await User.findOne({ where: { phone } });
            // if (existingPhone) {
            //     return res.status(400).json({ message: 'Phone number already exists' });
            // }
    
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
    
            // Create a new user
            const newUser = await User.create({
                username,
                email,
                phone,
                password: hashedPassword
            });
    
            res.status(201).json({ message: 'User created successfully', user: newUser });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Server error' });
        }
    },
 };
