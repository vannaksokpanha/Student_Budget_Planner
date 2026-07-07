const { Op } = require('sequelize');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// The single home for the app's money math. Every number the pages show
// (daily allowance, available, days remaining) is defined by the formulas in
// this file — controllers only orchestrate queries and responses around it.

// ── Expense type vocabulary ───────────────────────────────────────────────
// The three kinds of Expense rows. BILL and PLANNED live on the Budget page
// and reserve money from monthly income; DAILY is real spending logged on
// the Daily Log page.
const TYPES = {
  BILL: 'Monthly Bill',
  PLANNED: 'Expected Expense',
  DAILY: 'Daily Spending'
};
const BUDGET_TYPES = [TYPES.BILL, TYPES.PLANNED];

// ── Date helpers ──────────────────────────────────────────────────────────
// All date strings are local YYYY-MM-DD. Deliberately avoids toISOString(),
// which converts to UTC first and can shift the calendar day by ±1 in
// timezones ahead of/behind UTC (e.g. Cambodia, UTC+7).
const toDateString = (date) => {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const todayString = () => toDateString(new Date());

// [start, end] date bounds of the calendar month containing `date`
const monthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return [toDateString(start), toDateString(end)];
};

// Calendar days left in the current month, including today — today counts
// because today's spending is still ahead of the user
const daysRemainingInMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate() + 1;
};

// ── Bill identity ─────────────────────────────────────────────────────────
// A stable key for matching "the same bill" across months — category + name,
// case/whitespace-insensitive. Amount is deliberately excluded since it's
// allowed to change month to month.
const expenseKey = (e) =>
  `${e.category_id ?? 'none'}::${(e.expense_description || '').trim().toLowerCase()}`;

// ── The core formula ──────────────────────────────────────────────────────
// Given a user's monthly income:
//   available       = monthly_income − this month's planned (bills + expected)
//   daily_allowance = available ÷ days remaining (incl. today)
//
// This is the ONE place allowance semantics live — when the model changes
// (e.g. carrying over daily over/underspending), it changes here and every
// endpoint follows.
const computeBudgetNumbers = async (userId, monthlyIncome) => {
  const [start, end] = monthRange();
  const planned = await Expense.findAll({
    where: {
      user_id: userId,
      expense_type: { [Op.in]: BUDGET_TYPES },
      expense_date: { [Op.between]: [start, end] }
    }
  });
  const totalPlanned = planned.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const available = Math.max(0, parseFloat(monthlyIncome || 0) - totalPlanned);
  const days_remaining = daysRemainingInMonth();

  return {
    daily_allowance: days_remaining > 0 ? available / days_remaining : 0,
    available,
    days_remaining
  };
};

// Recomputes the user's numbers from their Budget row and persists the fresh
// daily_allowance. Safe when no budget exists yet — returns zeros.
const refreshBudget = async (userId) => {
  const budget = await Budget.findOne({ where: { user_id: userId } });
  if (!budget) {
    return { budget: null, daily_allowance: 0, available: 0, days_remaining: daysRemainingInMonth() };
  }
  const numbers = await computeBudgetNumbers(userId, budget.monthly_income);
  await budget.update({ daily_allowance: numbers.daily_allowance });
  return { budget, ...numbers };
};

module.exports = {
  TYPES,
  BUDGET_TYPES,
  toDateString,
  todayString,
  monthRange,
  daysRemainingInMonth,
  expenseKey,
  computeBudgetNumbers,
  refreshBudget
};
