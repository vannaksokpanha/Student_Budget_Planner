const { Op } = require('sequelize');
const Expense = require('../models/Expense');
const Category = require('../models/Category');

const monthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const pad = n => String(n).padStart(2, '0');
  const toStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return [toStr(start), toStr(end)];
};

const getAllExpenses = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth();
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const [start, end] = monthRange(new Date(year, month));
    const expenses = await Expense.findAll({
      where: {
        user_id: req.user.id,
        expense_date: { [Op.between]: [start, end] }
      },
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }],
      order: [['expense_date', 'ASC'], ['expense_id', 'ASC']]
    });
    return res.json(expenses);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

module.exports = { getAllExpenses };
