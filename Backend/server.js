const express = require('express');
const cors = require('cors');
require('dotenv').config(); // to add .env to process.env

const db = require('./connectDb');
const authRoutes = require('./Routes/authRoute');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);

app.listen(PORT, async () => {
  try {
    await db.getConnection();
    console.log('Database connected successfully');
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
});