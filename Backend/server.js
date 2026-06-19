const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config', '.env') });

const sequelize = require('./config/database');
require('./models/associations');
const authRoutes = require('./Routes/authRoute');
const homeRoutes = require('./Routes/homeRoute');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // This creates missing tables from your models.
    await sequelize.sync();
    console.log('Models synchronized with database');

    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
});
