const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const User = sequelize.define('User', {
     id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'user_id'
     },
     name: {
        type: DataTypes.STRING(45),
        allowNull: false,
        field: 'username'
     },
     email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
     },
     password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash'
     },
     
},{
        tableName: 'users'
});

module.exports = User;
