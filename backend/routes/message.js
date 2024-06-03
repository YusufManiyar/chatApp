const express = require('express');
const { addMessage } = require('../controller/message.js');
const { verifyToken } = require('../middleware/autho.js');

const router = express.Router();

router.post('/message', verifyToken, addMessage);

module.exports = router;