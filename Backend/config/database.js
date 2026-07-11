const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,        
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                require: true,             // ← Aiven requires SSL
                rejectUnauthorized: false  // ← accept Aiven's cert without a CA file
            }
        }
    }
);

module.exports = sequelize;