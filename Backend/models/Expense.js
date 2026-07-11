const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Expense = sequelize.define("Expense", {
    expense_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    group_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    expense_description: {
        type: DataTypes.TEXT
    },
    expense_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    // 'Monthly Bill'     — budget page, recurring; copied forward by "reuse last month"
    // 'Expected Expense'  — budget page, one-off; dies with its month
    // 'Daily Spending'    — daily log entries
    // 'Group Expense'     — shared group expenses
    // (renamed from 'Fixed' — if the server won't boot over old 'Fixed' rows,
    // drop the database and let sync recreate it)
    expense_type: {
        type: DataTypes.ENUM("Monthly Bill", "Expected Expense", "Daily Spending", "Group Expense")
    },
    // Budget-page types only: date the user ticked the item off as paid.
    // NULL = not paid yet. Status stamp only — never used in allowance math.
    paid_at: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    // Group Expense only: whether the contribution has actually been paid in,
    // set by the group owner — separate from paid_at, which is budget-page only.
    contribution_status: {
        type: DataTypes.ENUM("Paid", "Pending"),
        allowNull: true,
        defaultValue: "Paid"
    }
}, {
    tableName: "expenses",
    timestamps: false,
    indexes: [
        { fields: ["user_id", "expense_type", "expense_date"] }
    ]
});

module.exports = Expense;
