// this file is for realtionship 
const User = require("./User");    
const Budget = require("./Budget");
const BudgetGroup = require("./BudgetGroup");
const Membership = require("./Membership");
const Expense = require("./Expense");
const SavingGoal = require("./SavingGoal");

User.hasOne(Budget, { foreignKey: "user_id" });
Budget.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Membership, { foreignKey: "user_id" });
Membership.belongsTo(User, { foreignKey: "user_id" });

BudgetGroup.hasMany(Membership, { foreignKey: "group_id" });
Membership.belongsTo(BudgetGroup, { foreignKey: "group_id" });

User.hasMany(Expense, { foreignKey: "user_id", onDelete: "CASCADE" });
Expense.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

BudgetGroup.hasMany(Expense, { foreignKey: "group_id", onDelete: "SET NULL" });
Expense.belongsTo(BudgetGroup, { foreignKey: "group_id", onDelete: "SET NULL" });

User.hasMany(SavingGoal, { foreignKey: "user_id", onDelete: "CASCADE" });
SavingGoal.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

module.exports = {
    User,
    Budget,
    BudgetGroup,
    Membership,
    Expense,
    SavingGoal
};
