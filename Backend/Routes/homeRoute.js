const express = require('express');
const router = express.Router();

const homeRouter = require('../Controllers/homeController');

router.use('/', homeRouter);

module.exports = router;  
