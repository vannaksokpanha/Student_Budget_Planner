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
  DAILY: 'Daily Spending',
  SAVINGS: 'Savings'
};
const BUDGET_TYPES = [TYPES.BILL, TYPES.PLANNED];
// Everything that reserves money from monthly income before the allowance is
// spread: budget-page items plus this month's savings deposits ("pay yourself
// first" — a savings deposit is a bill to yourself)
const RESERVED_TYPES = [...BUDGET_TYPES, TYPES.SAVINGS];

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
// Allowance model: fixed base + carryover ("banking").
//
//   base            = (income − planned) ÷ days from the anchor to month end
//   daily_allowance = base × days credited so far − daily spending before today
//                     (what the user may spend TODAY, carryover included)
//   available       = income − planned − all daily spending this month
//
// The base only moves when income or bills change — never because the user
// spent money. Underspending yesterday banks into today; overspending digs
// into today. Spending exactly base every day keeps the allowance rock-steady.
// Today's own spending is deliberately excluded here: the Daily Log page
// subtracts it live on top of the returned allowance.
//
// `anchorDate` is when the user's budget began (Budget.start_date) — someone
// who sets up mid-month is only credited days from that point onward.
const computeBudgetNumbers = async (userId, monthlyIncome, anchorDate = null) => {
  const now = new Date();
  const [start, end] = monthRange(now);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = toDateString(now);

  const expenses = await Expense.findAll({
    where: {
      user_id: userId,
      expense_type: { [Op.in]: [...RESERVED_TYPES, TYPES.DAILY] },
      expense_date: { [Op.between]: [start, end] }
    }
  });

  // Sequelize may return DATEONLY as a string or a Date depending on dialect
  const dateOf = (e) =>
    typeof e.expense_date === 'string' ? e.expense_date : toDateString(new Date(e.expense_date));
  const sumWhere = (test) =>
    expenses.filter(test).reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const totalPlanned = sumWhere(e => RESERVED_TYPES.includes(e.expense_type));
  const spentThisMonth = sumWhere(e => e.expense_type === TYPES.DAILY);
  const spentBeforeToday = sumWhere(e => e.expense_type === TYPES.DAILY && dateOf(e) < today);

  const income = parseFloat(monthlyIncome || 0);

  // Day-of-month the budget starts counting from: the anchor's day when it
  // falls in the current month, otherwise the 1st
  const anchor = anchorDate ? new Date(anchorDate) : null;
  const anchorDay =
    anchor && anchor.getFullYear() === now.getFullYear() && anchor.getMonth() === now.getMonth()
      ? anchor.getDate()
      : 1;

  const budgetDays = daysInMonth - anchorDay + 1;                   // days the base spreads across
  const daysCredited = Math.max(0, now.getDate() - anchorDay + 1);  // allowance days granted so far (incl. today)

  const base = budgetDays > 0 ? Math.max(0, income - totalPlanned) / budgetDays : 0;

  return {
    daily_allowance: base * daysCredited - spentBeforeToday,
    base_allowance: base,
    available: Math.max(0, income - totalPlanned - spentThisMonth),
    days_remaining: daysRemainingInMonth()
  };
};

// Recomputes the user's numbers from their Budget row and persists the fresh
// base allowance. Safe when no budget exists yet — returns zeros.
const refreshBudget = async (userId) => {
  const budget = await Budget.findOne({ where: { user_id: userId } });
  if (!budget) {
    return { budget: null, daily_allowance: 0, base_allowance: 0, available: 0, days_remaining: daysRemainingInMonth() };
  }
  const numbers = await computeBudgetNumbers(userId, budget.monthly_income, budget.start_date);
  await budget.update({ daily_allowance: numbers.base_allowance });
  return { budget, ...numbers };
};

module.exports = {
  TYPES,
  BUDGET_TYPES,
  RESERVED_TYPES,
  toDateString,
  todayString,
  monthRange,
  daysRemainingInMonth,
  expenseKey,
  computeBudgetNumbers,
  refreshBudget
};
