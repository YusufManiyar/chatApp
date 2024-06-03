const express = require('express');
const { signUp, login, allUser } = require('../controller/user.js');
const { generateToken, verifyToken } = require('../middleware/autho.js');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login, generateToken);
router.get('/users', verifyToken, allUser)

module.exports = router;