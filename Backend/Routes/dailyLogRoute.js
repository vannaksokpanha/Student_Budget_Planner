const express = require('express');
const router = express.Router();
const {
  getDailyLogs,
  addDailyLog,
  updateDailyLog,
  deleteDailyLog,
  getPresets,
  addPreset,
  deletePreset
} = require('../Controllers/dailyLogController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, getDailyLogs);
router.post('/', verifyToken, addDailyLog);
router.put('/:id', verifyToken, updateDailyLog);
router.delete('/:id', verifyToken, deleteDailyLog);

router.get('/presets', verifyToken, getPresets);
router.post('/presets', verifyToken, addPreset);
router.delete('/presets/:id', verifyToken, deletePreset);

module.exports = router;
