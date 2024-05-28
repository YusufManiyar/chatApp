const express = require('express');
const { signUp } = require('../controller/user.js');

const router = express.Router();

router.post('/signup', signUp);

module.exports = router;
