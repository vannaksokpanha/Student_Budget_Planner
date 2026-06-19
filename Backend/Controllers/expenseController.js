const Expense = require('../models/Expense');

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { user_id: req.user.id },
      order: [['expense_date', 'DESC']]
    });
    return res.json(expenses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

const addExpense = async (req, res) => {
  try {
    const { category, amount, expense_description, expense_date, expense_type, quantity } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    const expense = await Expense.create({
      user_id: req.user.id,
      category,
      amount,
      quantity: quantity || 1,
      expense_description: expense_description || '',
      expense_date: expense_date || new Date().toISOString().split('T')[0],
      expense_type: expense_type || 'Daily Spending'
    });
    return res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOne({
      where: { expense_id: id, user_id: req.user.id }
    });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    await expense.destroy();
    return res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

module.exports = { getExpenses, addExpense, deleteExpense };
