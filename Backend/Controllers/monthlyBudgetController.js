const { Op } = require('sequelize');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const {
  TYPES,
  BUDGET_TYPES,
  todayString,
  monthRange,
  daysRemainingInMonth,
  expenseKey,
  computeBudgetNumbers,
  refreshBudget
} = require('../utils/budgetMath');

// Shared include so every expense response carries its category
const withCategory = [{ model: Category, attributes: ['category_id', 'name', 'color'] }];

// The derived numbers, renamed the way mutation responses expose them
const asNewNumbers = ({ daily_allowance, available, days_remaining }) => ({
  new_daily_allowance: daily_allowance,
  new_available: available,
  new_days_remaining: days_remaining
});

// ─── Route Handlers ──────────────────────────────────────────────────────────

// GET /api/monthly-budget
// Returns the user's budget together with all derived values so the frontend
// never has to calculate anything itself
const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ where: { user_id: req.user.id } });

    if (!budget) {
      return res.json({
        monthly_income: 0,
        daily_allowance: 0,
        available: 0,
        days_remaining: daysRemainingInMonth(),
        total_planned: 0,
        total_savings: 0,
        spent_this_month: 0,
        team_this_month: 0
      });
    }

    const numbers = await computeBudgetNumbers(req.user.id, budget.monthly_income, budget.start_date);
    return res.json({ ...budget.toJSON(), ...numbers });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// PUT /api/monthly-budget
// Saves a new monthly income set by the user, then recalculates and returns
// the updated daily_allowance, available, and days_remaining
const upsertBudget = async (req, res) => {
  try {
    // 0 is valid (income not set / cleared); negative or non-numeric is not
    const monthly_income = parseFloat(req.body.monthly_income);
    if (isNaN(monthly_income) || monthly_income < 0) {
      return res.status(400).json({ message: 'monthly_income must be a number of 0 or more' });
    }
    const userId = req.user.id;

    let budget = await Budget.findOne({ where: { user_id: userId } });
    // New budgets anchor to today — a mid-month signup isn't credited
    // allowance for days before they set up
    const anchor = budget ? budget.start_date : todayString();
    const numbers = await computeBudgetNumbers(userId, monthly_income, anchor);

    if (budget) {
      await budget.update({ monthly_income, daily_allowance: numbers.base_allowance });
    } else {
      budget = await Budget.create({
        user_id: userId,
        monthly_income: monthly_income || 0,
        daily_allowance: numbers.base_allowance,
        start_date: anchor
      });
    }

    return res.json({ ...budget.toJSON(), ...numbers });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// GET /api/monthly-budget/expenses
// Returns this month's budget-page expenses (bills + expected) for the user.
// They are scoped to the month they were added in — nothing carries over
// automatically once a new month starts (see restoreBills for bringing last
// month's bills forward).
const getExpenses = async (req, res) => {
  try {
    const [start, end] = monthRange();
    const expenses = await Expense.findAll({
      where: {
        user_id: req.user.id,
        expense_type: { [Op.in]: BUDGET_TYPES },
        expense_date: { [Op.between]: [start, end] }
      },
      include: withCategory,
      order: [['expense_id', 'ASC']]
    });
    return res.json(expenses);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// POST /api/monthly-budget/expenses
// Adds a new budget-page expense (Monthly Bill or Expected Expense), then
// recalculates and returns the updated numbers so the frontend can update
// without a second fetch
const addExpense = async (req, res) => {
  try {
    const { amount, category_id, expense_description, expense_type } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    // Which budget section the item belongs to; one-off is the safer default
    const type = BUDGET_TYPES.includes(expense_type) ? expense_type : TYPES.PLANNED;

    const userId = req.user.id;
    let expense = await Expense.create({
      user_id: userId,
      amount,
      category_id: category_id || null,
      expense_description: expense_description || '',
      expense_date: todayString(),
      expense_type: type
    });
    expense = await Expense.findByPk(expense.expense_id, { include: withCategory });

    const numbers = await refreshBudget(userId);
    return res.status(201).json({ ...expense.toJSON(), ...asNewNumbers(numbers) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// PUT /api/monthly-budget/expenses/:id
// Updates a budget-page expense, then recalculates and returns the updated numbers
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, category_id, expense_description, expense_type } = req.body;

    const expense = await Expense.findOne({
      where: { expense_id: id, user_id: userId, expense_type: { [Op.in]: BUDGET_TYPES } }
    });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const updates = { amount, category_id: category_id || null, expense_description };
    // Moving an item between sections (bill <-> one-off) is just a type change
    if (BUDGET_TYPES.includes(expense_type)) updates.expense_type = expense_type;
    await expense.update(updates);
    const updated = await Expense.findByPk(expense.expense_id, { include: withCategory });

    const numbers = await refreshBudget(userId);
    return res.json({ ...updated.toJSON(), ...asNewNumbers(numbers) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// DELETE /api/monthly-budget/expenses/:id
// Removes a budget-page expense, then recalculates and returns the updated numbers
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await Expense.findOne({
      where: { expense_id: id, user_id: userId, expense_type: { [Op.in]: BUDGET_TYPES } }
    });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    await expense.destroy();

    const numbers = await refreshBudget(userId);
    return res.json({ message: 'Deleted', ...asNewNumbers(numbers) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// PUT /api/monthly-budget/expenses/:id/paid
// Ticks a budget-page expense off as paid (body: { paid: true }) or unticks it
// ({ paid: false }). Purely a status stamp — the money was already reserved
// when the expense was added, so the allowance math never changes here.
const setExpensePaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paid } = req.body;

    const expense = await Expense.findOne({
      where: { expense_id: id, user_id: req.user.id, expense_type: { [Op.in]: BUDGET_TYPES } }
    });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    await expense.update({ paid_at: paid ? todayString() : null });

    const updated = await Expense.findByPk(expense.expense_id, { include: withCategory });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// POST /api/monthly-budget/expenses/restore
// Copies Monthly Bills (recurring items only — never Expected Expenses) from the
// most recent past month that had any into the current month. Skips any that would
// duplicate an expense already in the current month (same category + name) — the
// current month's entry always wins. Restored bills start unpaid.
const restoreBills = async (req, res) => {
  try {
    const userId = req.user.id;
    const [start, end] = monthRange();

    // Find the most recent bill from before this month, then pull every bill
    // from that same month
    const mostRecentPast = await Expense.findOne({
      where: { user_id: userId, expense_type: TYPES.BILL, expense_date: { [Op.lt]: start } },
      order: [['expense_date', 'DESC']]
    });

    if (!mostRecentPast) {
      return res.json({ message: 'No previous bills to restore', restored_count: 0 });
    }

    const [prevStart, prevEnd] = monthRange(new Date(mostRecentPast.expense_date));
    const previousBills = await Expense.findAll({
      where: { user_id: userId, expense_type: TYPES.BILL, expense_date: { [Op.between]: [prevStart, prevEnd] } }
    });

    // Dedupe against everything already on this month's budget page (both
    // sections) so a restored bill can't double-reserve money the user
    // already planned by hand
    const currentExpenses = await Expense.findAll({
      where: { user_id: userId, expense_type: { [Op.in]: BUDGET_TYPES }, expense_date: { [Op.between]: [start, end] } }
    });
    const existingKeys = new Set(currentExpenses.map(expenseKey));

    const toRestore = previousBills.filter(e => !existingKeys.has(expenseKey(e)));

    if (toRestore.length > 0) {
      await Expense.bulkCreate(toRestore.map(e => ({
        user_id: userId,
        category_id: e.category_id,
        amount: e.amount,
        expense_description: e.expense_description,
        expense_date: todayString(),
        expense_type: TYPES.BILL,
        paid_at: null
      })));
    }

    const numbers = await refreshBudget(userId);

    const expenses = await Expense.findAll({
      where: { user_id: userId, expense_type: { [Op.in]: BUDGET_TYPES }, expense_date: { [Op.between]: [start, end] } },
      include: withCategory,
      order: [['expense_id', 'ASC']]
    });

    return res.json({
      expenses,
      restored_count: toRestore.length,
      ...asNewNumbers(numbers)
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

module.exports = { getBudget, upsertBudget, getExpenses, addExpense, updateExpense, deleteExpense, setExpensePaid, restoreBills };
