const express = require('express');
const router = express.Router();
const { getAllExpenses } = require('../Controllers/expensesController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllExpenses);

module.exports = router;
