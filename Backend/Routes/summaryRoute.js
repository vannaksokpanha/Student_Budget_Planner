const express = require('express');
const router = express.Router();
const { getExpensesInRange } = require('../Controllers/summaryController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/expenses', verifyToken, getExpensesInRange);

module.exports = router;
