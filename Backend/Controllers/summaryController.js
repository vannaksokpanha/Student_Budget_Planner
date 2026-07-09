const { Op } = require('sequelize');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const { BUDGET_TYPES, TYPES } = require('../utils/budgetMath');

// GET /api/summary/expenses?start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns the money that actually left the user's pocket in the date range,
// with categories. One flexible endpoint serves both Summary sections: the day
// report passes start = end = the picked day, the category breakdown passes
// the first/last day of the picked month.
//
// "Actually left" means:
//   - Daily Spending counts on the day it was logged (expense_date)
//   - Budget-page items (Monthly Bill / Expected Expense) only count once the
//     user ticks them off as paid, on the day they were ticked (paid_at) —
//     an unpaid bill is a reservation, not spending, so it never shows here
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const getExpensesInRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!DATE_RE.test(start || '') || !DATE_RE.test(end || '')) {
      return res.status(400).json({ message: 'start and end query params are required (YYYY-MM-DD)' });
    }

    const expenses = await Expense.findAll({
      where: {
        user_id: req.user.id,
        [Op.or]: [
          {
            // Savings rows are transfers into goals, not spending — excluded
            expense_type: { [Op.notIn]: [...BUDGET_TYPES, TYPES.SAVINGS] },
            expense_date: { [Op.between]: [start, end] }
          },
          {
            expense_type: { [Op.in]: BUDGET_TYPES },
            paid_at: { [Op.between]: [start, end] }
          }
        ]
      },
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }],
      order: [['expense_date', 'DESC'], ['expense_id', 'DESC']]
    });
    return res.json(expenses);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

module.exports = { getExpensesInRange };
