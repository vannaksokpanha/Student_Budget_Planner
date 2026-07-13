const Expense = require('../models/Expense');
const ExpensePreset = require('../models/ExpensePreset');
const Category = require('../models/Category');
const { TYPES, todayString } = require('../utils/budgetMath');

const getDailyLogs = async (req, res) => {
  try {
    const logs = await Expense.findAll({
      where: { user_id: req.user.id, expense_type: TYPES.DAILY, expense_date: todayString() },
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }],
      order: [['expense_id', 'DESC']]
    });
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

const addDailyLog = async (req, res) => {
  try {
    const { amount, category_id, expense_description, expense_date } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    let log = await Expense.create({
      user_id: req.user.id,
      amount,
      category_id: category_id || null,
      expense_description: expense_description || '',
      expense_date: expense_date || todayString(),
      expense_type: TYPES.DAILY
    });
    log = await Expense.findByPk(log.expense_id, {
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }]
    });
    return res.status(201).json(log);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

const updateDailyLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category_id, expense_description, expense_date } = req.body;
    const log = await Expense.findOne({
      where: { expense_id: id, user_id: req.user.id, expense_type: TYPES.DAILY }
    });
    if (!log) return res.status(404).json({ message: 'Entry not found' });
    await log.update({ amount, category_id: category_id || null, expense_description, expense_date });
    const updated = await Expense.findByPk(log.expense_id, {
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }]
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

const deleteDailyLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await Expense.findOne({
      where: { expense_id: id, user_id: req.user.id, expense_type: TYPES.DAILY }
    });
    if (!log) return res.status(404).json({ message: 'Entry not found' });
    await log.destroy();
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

const getPresets = async (req, res) => {
  try {
    const presets = await ExpensePreset.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }],
      order: [['preset_id', 'ASC']]
    });
    return res.json(presets);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

const addPreset = async (req, res) => {
  try {
    const { category_id, amount, note } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    let preset = await ExpensePreset.create({
      user_id: req.user.id,
      category_id: category_id || null,
      amount,
      note: note || ''
    });
    preset = await ExpensePreset.findByPk(preset.preset_id, {
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }]
    });
    return res.status(201).json(preset);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

const deletePreset = async (req, res) => {
  try {
    const { id } = req.params;
    const preset = await ExpensePreset.findOne({
      where: { preset_id: id, user_id: req.user.id }
    });
    if (!preset) return res.status(404).json({ message: 'Preset not found' });
    await preset.destroy();
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

module.exports = {
  getDailyLogs,
  addDailyLog,
  updateDailyLog,
  deleteDailyLog,
  getPresets,
  addPreset,
  deletePreset
};
