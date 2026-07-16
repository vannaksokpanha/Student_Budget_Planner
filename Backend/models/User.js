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
     // 👇 only this line added
     createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'   // optional – if your column is named 'created_at'
     }

},{
        tableName: 'users',
        timestamps: false,    // remains false – we handle it manually
        indexes: [
            { unique: true, fields: ['email'], name: 'users_email_unique' }
        ]
});

module.exports = User;