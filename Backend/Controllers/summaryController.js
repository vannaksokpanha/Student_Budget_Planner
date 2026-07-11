const { Op } = require('sequelize');
const Expense = require('../models/Expense');
const Category = require('../models/Category');

// GET /api/summary/expenses?start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns every expense (all types) the user logged in the date range, with its
// category. One flexible endpoint serves both Summary sections: the day report
// passes start = end = the picked day, the category breakdown passes the
// first/last day of the picked month.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const getExpensesInRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!DATE_RE.test(start || '') || !DATE_RE.test(end || '')) {
      return res.status(400).json({ message: 'start and end query params are required (YYYY-MM-DD)' });
    }

    const expenses = await Expense.findAll({
      where: { user_id: req.user.id, expense_date: { [Op.between]: [start, end] } },
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }],
      order: [['expense_date', 'DESC'], ['expense_id', 'DESC']]
    });
    return res.json(expenses);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

module.exports = { getExpensesInRange };
