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
    category: {
        type: DataTypes.STRING(50)
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
    expense_type: {
        type: DataTypes.ENUM("Fixed", "Daily Spending", "Group Expense")
    }
}, {
    tableName: "expenses",
    timestamps: false
});

module.exports = Expense;
