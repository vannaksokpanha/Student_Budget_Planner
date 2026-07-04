const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Budget = sequelize.define('Budget', {
    budget_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
    },
    monthly_income: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    daily_allowance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
}, {
    tableName: "budgets",
    timestamps: false
});

module.exports = Budget;
