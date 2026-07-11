const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

// What a contribution was actually spent on — e.g. contribution "Panha: $100
// for food" breaks down into items like Pasta $15, Pizza $20, Rice $10.
// Only the member who owns the parent contribution can add items to it.
const ExpenseItem = sequelize.define("ExpenseItem", {
    item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    expense_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    tableName: "expense_items",
    timestamps: false
});

module.exports = ExpenseItem;
