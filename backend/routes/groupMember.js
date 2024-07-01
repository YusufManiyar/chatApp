const express = require('express');
const { getGroupMember, addGroupMember, deleteGroupMember, putGroupMember } = require('../controller/groupMember.js');
const { verifyToken } = require('../middleware/autho.js');

const router = express.Router();

router.get('/', verifyToken, getGroupMember);
router.post('/', verifyToken, addGroupMember);
router.delete('/', verifyToken, deleteGroupMember)
router.put('/', verifyToken, putGroupMember)

module.exports = router;