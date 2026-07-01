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
const liabilityKey = (l) => `${l.category_id ?? 'none'}::${(l.expense_description || '').trim().toLowerCase()}`;

// Core calculation: given a user's monthly income, returns
//   daily_allowance  – how much they can spend each remaining day
//   available        – what is left after liabilities
//   days_remaining   – calendar days left this month
//
// Formula:
//   available       = monthly_income − total_fixed_liabilities
//   daily_allowance = available / days_remaining
const recalculateDailyAllowance = async (userId, monthly_income) => {
  // Sum this month's fixed expenses (liabilities) only — liabilities are scoped
  // to the month they were added in, not permanent
  const [start, end] = monthRange();
  const liabilities = await Expense.findAll({
    where: { user_id: userId, expense_type: 'Fixed', expense_date: { [Op.between]: [start, end] } }
  });
  const totalFixed = liabilities.reduce((sum, l) => sum + parseFloat(l.amount), 0);

  const available = Math.max(0, parseFloat(monthly_income || 0) - totalFixed);
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

// GET /api/monthly-budget/liabilities
// Returns this month's fixed expenses (liabilities) for the user. Liabilities are
// scoped to the month they were added in — nothing carries over automatically once
// a new month starts (see restoreLiabilities for bringing last month's forward).
const getLiabilities = async (req, res) => {
  try {
    const [start, end] = monthRange();
    const liabilities = await Expense.findAll({
      where: { user_id: req.user.id, expense_type: 'Fixed', expense_date: { [Op.between]: [start, end] } },
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }],
      order: [['expense_id', 'ASC']]
    });
    return res.json(liabilities);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// POST /api/monthly-budget/liabilities
// Adds a new fixed monthly expense, then recalculates and returns the updated
// daily_allowance, available, and days_remaining so the frontend can update
// without a second fetch
const addLiability = async (req, res) => {
  try {
    const { amount, category_id, expense_description } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const userId = req.user.id;
    let liability = await Expense.create({
      user_id: userId,
      amount,
      category_id: category_id || null,
      expense_description: expense_description || '',
      expense_date: toDateString(new Date()),
      expense_type: 'Fixed'
    });
    liability = await Expense.findByPk(liability.expense_id, {
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
      ...liability.toJSON(),
      new_daily_allowance: daily_allowance,
      new_available: available,
      new_days_remaining: days_remaining
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// PUT /api/monthly-budget/liabilities/:id
// Updates a fixed monthly expense, then recalculates and returns the updated
// daily_allowance, available, and days_remaining
const updateLiability = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, category_id, expense_description } = req.body;

    const liability = await Expense.findOne({
      where: { expense_id: id, user_id: userId, expense_type: 'Fixed' }
    });
    if (!liability) return res.status(404).json({ message: 'Liability not found' });

    await liability.update({ amount, category_id: category_id || null, expense_description });
    const updated = await Expense.findByPk(liability.expense_id, {
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

// DELETE /api/monthly-budget/liabilities/:id
// Removes a fixed monthly expense, then recalculates and returns the updated
// daily_allowance, available, and days_remaining
const deleteLiability = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const liability = await Expense.findOne({
      where: { expense_id: id, user_id: userId, expense_type: 'Fixed' }
    });
    if (!liability) return res.status(404).json({ message: 'Liability not found' });
    await liability.destroy();

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

// POST /api/monthly-budget/liabilities/restore
// Copies liabilities from the most recent past month that had any into the current
// month. Skips any that would duplicate a liability already in the current month
// (same category + name) — the current month's entry always wins.
const restoreLiabilities = async (req, res) => {
  try {
    const userId = req.user.id;
    const [start] = monthRange();

    // Find the most recent liability from before this month, then pull every
    // liability from that same month
    const mostRecentPast = await Expense.findOne({
      where: { user_id: userId, expense_type: 'Fixed', expense_date: { [Op.lt]: start } },
      order: [['expense_date', 'DESC']]
    });

    if (!mostRecentPast) {
      return res.json({ message: 'No previous liabilities to restore', restored_count: 0 });
    }

    const [prevStart, prevEnd] = monthRange(new Date(mostRecentPast.expense_date));
    const previousLiabilities = await Expense.findAll({
      where: { user_id: userId, expense_type: 'Fixed', expense_date: { [Op.between]: [prevStart, prevEnd] } }
    });

    const currentLiabilities = await Expense.findAll({
      where: { user_id: userId, expense_type: 'Fixed', expense_date: { [Op.between]: [start, monthRange()[1]] } }
    });
    const existingKeys = new Set(currentLiabilities.map(liabilityKey));

    const toRestore = previousLiabilities.filter(l => !existingKeys.has(liabilityKey(l)));

    if (toRestore.length > 0) {
      const today = toDateString(new Date());
      await Expense.bulkCreate(toRestore.map(l => ({
        user_id: userId,
        category_id: l.category_id,
        amount: l.amount,
        expense_description: l.expense_description,
        expense_date: today,
        expense_type: 'Fixed'
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

    const liabilities = await Expense.findAll({
      where: { user_id: userId, expense_type: 'Fixed', expense_date: { [Op.between]: [start, monthRange()[1]] } },
      include: [{ model: Category, attributes: ['category_id', 'name', 'color'] }],
      order: [['expense_id', 'ASC']]
    });

    return res.json({
      liabilities,
      restored_count: toRestore.length,
      new_daily_allowance: daily_allowance,
      new_available: available,
      new_days_remaining: days_remaining
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

module.exports = { getBudget, upsertBudget, getLiabilities, addLiability, updateLiability, deleteLiability, restoreLiabilities };
