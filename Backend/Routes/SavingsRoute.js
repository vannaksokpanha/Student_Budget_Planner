const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
    get_Goals,
    add_Goal,
    delete_Goal,
    update_Savings
} = require('../Controllers/SavingsController.js');

router.get('/', verifyToken, get_Goals);
router.post('/', verifyToken, add_Goal);
router.put('/:id', verifyToken, update_Savings);
router.delete('/:id', verifyToken, delete_Goal);

module.exports = router;