const express = require('express');
const router = express.Router();
const { getBudget, upsertBudget, getExpenses, addExpense, updateExpense, deleteExpense, setExpensePaid, restoreBills } = require('../Controllers/monthlyBudgetController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, getBudget);
router.put('/', verifyToken, upsertBudget);
router.get('/expenses', verifyToken, getExpenses);
router.post('/expenses', verifyToken, addExpense);
router.post('/expenses/restore', verifyToken, restoreBills);
router.put('/expenses/:id/paid', verifyToken, setExpensePaid);
router.put('/expenses/:id', verifyToken, updateExpense);
router.delete('/expenses/:id', verifyToken, deleteExpense);

module.exports = router;
