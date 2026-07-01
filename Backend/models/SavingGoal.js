const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const SavingGoal = sequelize.define("SavingGoal", {
    goal_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    goal_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    target_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    current_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    target_date: {
        type: DataTypes.DATEONLY
    }
}, {
    tableName: "saving_goals"
});

module.exports = SavingGoal;
