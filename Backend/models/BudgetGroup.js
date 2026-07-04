const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const BudgetGroup = sequelize.define("BudgetGroup", {
    group_id: {
        type: DataTypes.INTEGER,
        primaryKey:  true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    group_budget: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    }
}, {
    tableName: "budget_groups",
    timestamps: false
});

module.exports = BudgetGroup;
