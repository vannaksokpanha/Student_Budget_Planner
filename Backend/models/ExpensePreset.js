const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const ExpensePreset = sequelize.define("ExpensePreset", {
    preset_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    note: {
        type: DataTypes.STRING(255)
    }
}, {
    tableName: "expense_presets"
});

module.exports = ExpensePreset;
