const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/connectDb');
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
    const connection = await db.getConnection();
    connection.release();

    console.log('Database connected successfully');
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
});
