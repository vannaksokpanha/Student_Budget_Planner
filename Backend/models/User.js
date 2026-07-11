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
        allowNull: false
     },
     password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash'
     },

},{
        tableName: 'users',
        timestamps: false,
        // Named explicitly so sync({ alter: true }) recognizes it as already
        // existing on restart instead of adding a new duplicate unique index
        // each time (the same bug ran budget_groups out of MySQL's 64-key
        // limit once already).
        indexes: [
            { unique: true, fields: ['email'], name: 'users_email_unique' }
        ]
});

module.exports = User;
