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
        allowNull: false
    },
    // When this invite token was (re)issued — joinGroup rejects it once
    // more than 24h old. Not full timestamps: just the one thing that expires.
    // Uses a real DB-level default (not just DataTypes.NOW, which is
    // app-side only) so MySQL can backfill existing rows when this column
    // is added via alter — otherwise it tries '0000-00-00' and fails.
    token_created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
}, {
    tableName: "budget_groups",
    timestamps: false,
    // Named explicitly so sync({ alter: true }) recognizes it as already
    // existing on restart instead of adding a new duplicate unique index
    // each time (that ran the table out of MySQL's 64-key limit once).
    indexes: [
        { unique: true, fields: ["token"], name: "budget_groups_token_unique" }
    ]
});

module.exports = BudgetGroup;
