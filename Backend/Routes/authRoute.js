const express = require('express');
const router = express.Router();
const { login } = require('../Controllers/authController');

router.get('/login', login);

module.exports = router;