const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Category = sequelize.define("Category", {
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    color: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: '#6B7280'
    }
}, {
    tableName: "categories"
});

module.exports = Category;
