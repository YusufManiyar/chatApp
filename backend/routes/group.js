const express = require('express');
const { addGroup, getGroup } = require('../controller/group.js');
const { verifyToken } = require('../middleware/autho.js');

const router = express.Router();

router.post('/', verifyToken, addGroup);
router.get('/', verifyToken, getGroup);

module.exports = router;