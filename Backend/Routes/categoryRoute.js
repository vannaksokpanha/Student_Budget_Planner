const express = require('express');
const router = express.Router();
const { getCategories, addCategory, deleteCategory } = require('../Controllers/categoryController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, getCategories);
router.post('/', verifyToken, addCategory);
router.delete('/:id', verifyToken, deleteCategory);

module.exports = router;
