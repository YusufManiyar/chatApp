const express = require('express');
const { signUp, login } = require('../controller/user.js');
const { generateToken } = require('../middleware/autho.js');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login, generateToken);

module.exports = router;
