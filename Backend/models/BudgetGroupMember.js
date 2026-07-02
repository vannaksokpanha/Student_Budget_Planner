const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const BudgetGroupMember = sequelize.define("BudgetGroupMember", {
    member_id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:  true
    },
    user_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    group_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    member_role:{
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'member'

    },
    joined_at:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "budget_group_members",
    timestamps: false,
    indexes: [
        { unique: true, fields: ["user_id", "group_id"] }
    ]
});

module.exports = BudgetGroupMember;
