// this file is for realtionship 
const User = require("./User");
const Budget = require("./Budget");
const BudgetGroup = require("./BudgetGroup");
const BudgetGroupMember = require("./BudgetGroupMember");
const Expense = require("./Expense");
const ExpenseItem = require("./ExpenseItem");
const ExpensePreset = require("./ExpensePreset");
const SavingGoal = require("./SavingGoal");
const Category = require("./Category");

User.hasOne(Budget, { foreignKey: "user_id" });
Budget.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(BudgetGroupMember, { foreignKey: "user_id" });
BudgetGroupMember.belongsTo(User, { foreignKey: "user_id" });

BudgetGroup.hasMany(BudgetGroupMember, { foreignKey: "group_id" });
BudgetGroupMember.belongsTo(BudgetGroup, { foreignKey: "group_id" });

User.hasMany(Expense, { foreignKey: "user_id", onDelete: "CASCADE" });
Expense.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

BudgetGroup.hasMany(Expense, { foreignKey: "group_id", onDelete: "SET NULL" });
Expense.belongsTo(BudgetGroup, { foreignKey: "group_id", onDelete: "SET NULL" });

Expense.hasMany(ExpenseItem, { foreignKey: "expense_id", onDelete: "CASCADE" });
ExpenseItem.belongsTo(Expense, { foreignKey: "expense_id", onDelete: "CASCADE" });

User.hasMany(SavingGoal, { foreignKey: "user_id", onDelete: "CASCADE" });
SavingGoal.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

User.hasMany(ExpensePreset, { foreignKey: "user_id", onDelete: "CASCADE" });
ExpensePreset.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

User.hasMany(Category, { foreignKey: "user_id", onDelete: "CASCADE" });
Category.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

Category.hasMany(Expense, { foreignKey: "category_id", onDelete: "SET NULL" });
Expense.belongsTo(Category, { foreignKey: "category_id" });

Category.hasMany(ExpensePreset, { foreignKey: "category_id", onDelete: "SET NULL" });
ExpensePreset.belongsTo(Category, { foreignKey: "category_id" });

module.exports = {
    User,
    Budget,
    BudgetGroup,
    BudgetGroupMember,
    Expense,
    ExpenseItem,
    ExpensePreset,
    SavingGoal,
    Category
};
