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
    expense_type: {
        type: DataTypes.ENUM("Fixed", "Daily Spending", "Group Expense")
    }
}, {
    tableName: "expenses",
    indexes: [
        { fields: ["user_id", "expense_type", "expense_date"] }
    ]
});

module.exports = Expense;
