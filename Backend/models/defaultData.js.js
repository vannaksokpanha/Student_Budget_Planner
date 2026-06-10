const DEFAULT_BUDGET = {
  current_budget: 0.00,
  daily_budget: 0.00
};

const DEFAULT_EXPENSE_CATEGORIES = [
  { category: "FOODS & DRINKS", total_amount: 0, percentage: 0 },
  { category: "CLOTHES", total_amount: 0, percentage: 0 },
  { category: "SKINCARE", total_amount: 0, percentage: 0 },
  { category: "TRANSPORT", total_amount: 0, percentage: 0 },
  { category: "FUN NIGHTS", total_amount: 0, percentage: 0 },
  { category: "OTHERS", total_amount: 0, percentage: 0 }
];

const DEFAULT_TODAY_SPENDING = [];

module.exports = {
  DEFAULT_BUDGET,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_TODAY_SPENDING
};