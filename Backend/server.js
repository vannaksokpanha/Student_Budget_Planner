const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sequelize = require('./config/database');
require('./models/associations');
const authRoutes = require('./Routes/authRoute');
const homeRoutes = require('./Routes/homeRoute');
const dailyLogRoutes = require('./Routes/dailyLogRoute');
const monthlyBudgetRoutes = require('./Routes/monthlyBudgetRoute');
const savingsRoutes = require('./Routes/SavingsRoute');
const categoryRoutes = require('./Routes/categoryRoute');
const userRoutes = require('./Routes/userRoute');
const teamBudget = require('./Routes/TeamBudgetRoute');
const summaryRoutes = require('./Routes/summaryRoute');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/daily-log', dailyLogRoutes);
app.use('/api/monthly-budget', monthlyBudgetRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/team-budget', teamBudget);
app.use('/api/summary', summaryRoutes);

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    await sequelize.sync({ alter: true });
    console.log('Models synchronized with database');

    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
});
