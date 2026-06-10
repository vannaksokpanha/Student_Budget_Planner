const express = require('express');
const router = express.Router();

const homeRouter = require('../controllers/homeController');

router.use('/', homeRouter);

module.exports = router;  