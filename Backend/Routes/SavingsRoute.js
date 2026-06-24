const express = require('express');
const router = express.Router();
const { login, signup } = require('../Controllers/authController');

const {
    get_Goals,
    add_Goal,
    delete_Goal,
    update_Savings
} = require('../Controllers/SavingsController.js');

router.get('/', get_Goals);
router.post('/', add_Goal);
router.put('/:id', update_Savings);
router.delete('/:id', delete_Goal);

module.export = router;