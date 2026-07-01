const express = require('express');
const router = express.Router();
const { getBudget, upsertBudget, getLiabilities, addLiability, updateLiability, deleteLiability, restoreLiabilities } = require('../Controllers/monthlyBudgetController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, getBudget);
router.put('/', verifyToken, upsertBudget);
router.get('/liabilities', verifyToken, getLiabilities);
router.post('/liabilities', verifyToken, addLiability);
router.post('/liabilities/restore', verifyToken, restoreLiabilities);
router.put('/liabilities/:id', verifyToken, updateLiability);
router.delete('/liabilities/:id', verifyToken, deleteLiability);

module.exports = router;
