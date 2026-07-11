const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const { getProfile } = require('../Controllers/userController');

router.get('/profile', verifyToken, getProfile);

module.exports = router;
