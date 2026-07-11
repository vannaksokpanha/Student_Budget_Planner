const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
    getGroups, handleCreateGroup, joinGroup, getGroupExpenses, addContribution,
    leaveGroup, getGroupMembers, removeMember, getExpenseItems, addExpenseItem,
    deleteGroup, deleteContribution, deleteExpenseItem
} = require('../Controllers/TeamBudgetController');

router.get('/groups', verifyToken, getGroups);
router.post('/groups', verifyToken, handleCreateGroup);
router.post('/groups/join', verifyToken, joinGroup);
router.delete('/groups/:groupId', verifyToken, deleteGroup);
router.get('/groups/:groupId/expenses', verifyToken, getGroupExpenses);
router.post('/groups/:groupId/expenses', verifyToken, addContribution);
router.delete('/groups/:groupId/expenses/:expenseId', verifyToken, deleteContribution);
router.get('/groups/:groupId/expenses/:expenseId/items', verifyToken, getExpenseItems);
router.post('/groups/:groupId/expenses/:expenseId/items', verifyToken, addExpenseItem);
router.delete('/groups/:groupId/expenses/:expenseId/items/:itemId', verifyToken, deleteExpenseItem);
router.get('/groups/:groupId/members', verifyToken, getGroupMembers);
// '/members/me' must stay registered before the '/members/:userId' pattern below,
// otherwise Express would match "me" as a userId and call removeMember instead.
router.delete('/groups/:groupId/members/me', verifyToken, leaveGroup);
router.delete('/groups/:groupId/members/:userId', verifyToken, removeMember);

module.exports = router;