const { Op } = require('sequelize');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const Category = require('../models/Category');

// ─── Helpers ────────────────────────────────────────────────────────────────

// Returns how many calendar days are left in the current month (including today)
const daysRemainingInMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate() + 1;
};

// Formats a Date as a local YYYY-MM-DD string. Deliberately avoids toISOString(),
// which converts to UTC first and can shift the calendar day by ±1 in timezones
// ahead of/behind UTC (e.g. midnight local time on the 1st becomes the previous
// day once converted to UTC in UTC+ zones).
const toDateString = (date) => {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Returns the [start, end] date bounds of the calendar month containing `date`
const monthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return [toDateString(start), toDateString(end)];
};

// A stable key for matching "the same bill" across months — category + name,
// case/whitespace-insensitive. Amount is deliberately excluded since it's allowed to change.
const expenseKey = (e) => `${e.category_id ?? 'none'}::${(e.expense_description || '').trim().toLowerCase()}`;

// The two expense types that live on the budget page. Both reserve money from
// monthly income identically — the type only decides which section an item
// appears in and whether "reuse last month" copies it forward.
const BUDGET_TYPES = ['Monthly Bill', 'Expected Expense'];

// Core calculation: given a user's monthly income, returns
//   daily_allowance  – how much they can spend each remaining day
//   available        – what is left after the budget page's planned expenses
//   days_remaining   – calendar days left this month
//
// Formula:
//   available       = monthly_income − total_planned
//   daily_allowance = available / days_remaining
const recalculateDailyAllowance = async (userId, monthly_income) => {
  // Sum this month's budget-page items (bills + expected expenses) — both are
  // scoped to the month they were added in, not permanent
  const [start, end] = monthRange();
  const expenses = await Expense.findAll({
    where: { user_id: userId, expense_type: { [Op.in]: BUDGET_TYPES }, expense_date: { [Op.between]: [start, end] } }
  });
  const totalPlanned = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const available = Math.max(0, parseFloat(monthly_income || 0) - totalPlanned);
  const days_remaining = daysRemainingInMonth();

  return {
    daily_allowance: days_remaining > 0 ? available / days_remaining : 0,
    available,
    days_remaining
  };
};

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
        days_remaining: daysRemainingInMonth()
      });
    }

    const { daily_allowance, available, days_remaining } =
      await recalculateDailyAllowance(req.user.id, budget.monthly_income);

    return res.json({ ...budget.toJSON(), daily_allowance, available, days_remaining });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// PUT /api/monthly-budget
// Saves a new monthly income set by the user, then recalculates and returns
// the updated daily_allowance, available, and days_remaining
const upsertBudget = async (req, res) => {
  try {
    const { monthly_income } = req.body;
    const userId = req.user.id;

    const { daily_allowance, available, days_remaining } =
      await recalculateDailyAllowance(userId, monthly_income);

    let budget = await Budget.findOne({ where: { user_id: userId } });
    if (budget) {
      await budget.update({ monthly_income, daily_allowance });
    } else {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      budget = await Budget.create({
        user_id: userId,
        monthly_income: monthly_income || 0,
        daily_allowance,
        start_date: toDateString(startOfMonth)
      });
    }

    return res.json({ ...budget.toJSON(), daily_allowance, available, days_remaining });
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
      where: { user_id: req.user.id, expense_type: { [Op.in]: BUDGET_TYPES }, expense_date: { [Op.between]: [start, end] } },
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }],
      order: [['expense_id', 'ASC']]
    });
    return res.json(expenses);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// POST /api/monthly-budget/expenses
// Adds a new budget-page expense (Monthly Bill or Expected Expense), then
// recalculates and returns the updated daily_allowance, available, and
// days_remaining so the frontend can update without a second fetch
const addExpense = async (req, res) => {
  try {
    const { amount, category_id, expense_description, expense_type } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    // Which budget section the item belongs to; one-off is the safer default
    const type = BUDGET_TYPES.includes(expense_type) ? expense_type : 'Expected Expense';

    const userId = req.user.id;
    let expense = await Expense.create({
      user_id: userId,
      amount,
      category_id: category_id || null,
      expense_description: expense_description || '',
      expense_date: toDateString(new Date()),
      expense_type: type
    });
    expense = await Expense.findByPk(expense.expense_id, {
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }]
    });

    // Recalculate and persist the new daily allowance
    const budget = await Budget.findOne({ where: { user_id: userId } });
    let daily_allowance = 0, available = 0, days_remaining = daysRemainingInMonth();
    if (budget) {
      ({ daily_allowance, available, days_remaining } =
        await recalculateDailyAllowance(userId, budget.monthly_income));
      await budget.update({ daily_allowance });
    }

    return res.status(201).json({
      ...expense.toJSON(),
      new_daily_allowance: daily_allowance,
      new_available: available,
      new_days_remaining: days_remaining
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// PUT /api/monthly-budget/expenses/:id
// Updates a budget-page expense, then recalculates and returns the updated
// daily_allowance, available, and days_remaining
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
    const updated = await Expense.findByPk(expense.expense_id, {
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }]
    });

    // Recalculate and persist the new daily allowance
    const budget = await Budget.findOne({ where: { user_id: userId } });
    let daily_allowance = 0, available = 0, days_remaining = daysRemainingInMonth();
    if (budget) {
      ({ daily_allowance, available, days_remaining } =
        await recalculateDailyAllowance(userId, budget.monthly_income));
      await budget.update({ daily_allowance });
    }

    return res.json({
      ...updated.toJSON(),
      new_daily_allowance: daily_allowance,
      new_available: available,
      new_days_remaining: days_remaining
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// DELETE /api/monthly-budget/expenses/:id
// Removes a budget-page expense, then recalculates and returns the updated
// daily_allowance, available, and days_remaining
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await Expense.findOne({
      where: { expense_id: id, user_id: userId, expense_type: { [Op.in]: BUDGET_TYPES } }
    });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    await expense.destroy();

    // Recalculate and persist the new daily allowance
    const budget = await Budget.findOne({ where: { user_id: userId } });
    let daily_allowance = 0, available = 0, days_remaining = daysRemainingInMonth();
    if (budget) {
      ({ daily_allowance, available, days_remaining } =
        await recalculateDailyAllowance(userId, budget.monthly_income));
      await budget.update({ daily_allowance });
    }

    return res.json({
      message: 'Deleted',
      new_daily_allowance: daily_allowance,
      new_available: available,
      new_days_remaining: days_remaining
    });
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

    await expense.update({ paid_at: paid ? toDateString(new Date()) : null });

    const updated = await Expense.findByPk(expense.expense_id, {
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }]
    });
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
    const [start] = monthRange();

    // Find the most recent bill from before this month, then pull every bill
    // from that same month
    const mostRecentPast = await Expense.findOne({
      where: { user_id: userId, expense_type: 'Monthly Bill', expense_date: { [Op.lt]: start } },
      order: [['expense_date', 'DESC']]
    });

    if (!mostRecentPast) {
      return res.json({ message: 'No previous bills to restore', restored_count: 0 });
    }

    const [prevStart, prevEnd] = monthRange(new Date(mostRecentPast.expense_date));
    const previousBills = await Expense.findAll({
      where: { user_id: userId, expense_type: 'Monthly Bill', expense_date: { [Op.between]: [prevStart, prevEnd] } }
    });

    // Dedupe against everything already on this month's budget page (both
    // sections) so a restored bill can't double-reserve money the user
    // already planned by hand
    const currentExpenses = await Expense.findAll({
      where: { user_id: userId, expense_type: { [Op.in]: BUDGET_TYPES }, expense_date: { [Op.between]: [start, monthRange()[1]] } }
    });
    const existingKeys = new Set(currentExpenses.map(expenseKey));

    const toRestore = previousBills.filter(e => !existingKeys.has(expenseKey(e)));

    if (toRestore.length > 0) {
      const today = toDateString(new Date());
      await Expense.bulkCreate(toRestore.map(e => ({
        user_id: userId,
        category_id: e.category_id,
        amount: e.amount,
        expense_description: e.expense_description,
        expense_date: today,
        expense_type: 'Monthly Bill',
        paid_at: null
      })));
    }

    // Recalculate and persist the new daily allowance
    const budget = await Budget.findOne({ where: { user_id: userId } });
    let daily_allowance = 0, available = 0, days_remaining = daysRemainingInMonth();
    if (budget) {
      ({ daily_allowance, available, days_remaining } =
        await recalculateDailyAllowance(userId, budget.monthly_income));
      await budget.update({ daily_allowance });
    }

    const expenses = await Expense.findAll({
      where: { user_id: userId, expense_type: { [Op.in]: BUDGET_TYPES }, expense_date: { [Op.between]: [start, monthRange()[1]] } },
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }],
      order: [['expense_id', 'ASC']]
    });

    return res.json({
      expenses,
      restored_count: toRestore.length,
      new_daily_allowance: daily_allowance,
      new_available: available,
      new_days_remaining: days_remaining
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

module.exports = { getBudget, upsertBudget, getExpenses, addExpense, updateExpense, deleteExpense, setExpensePaid, restoreBills };
