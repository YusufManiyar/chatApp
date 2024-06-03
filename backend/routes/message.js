const express = require('express');
const { addMessage, getMessage } = require('../controller/message.js');
const { verifyToken } = require('../middleware/autho.js');

const router = express.Router();

router.post('/', verifyToken, addMessage);
router.get('/', verifyToken, getMessage);

module.exports = router;