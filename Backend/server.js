// import modules 
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './connectDb.js';
import authRoutes from './Routes/authRoute.js';
import login from './login.jsx';
import axios from 'axios';
import mysql from 'mysql2/promise';

// Load environment variables from .env file

// to add .env to process.env
dotenv.config(); 
console.log("ENV TEST:", process.env.DB_USER);
//for intializing express app,cors 


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});u 

<<<<<<< Updated upstream
const db = require('./config/connectDb');
const authRoutes = require('./routes/authRoute');
const homeRoutes = require('./routes/homeRoute');
const PORT = process.env.PORT || 5000;
=======
const db = require('./connectDb');
const authRoutes = require('./Routes/authRoute');
const PORT = 5000;
>>>>>>> Stashed changes
const app = express();

app.use(cors());
app.use(express.json());

<<<<<<< Updated upstream
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);

=======
app.use('/api', authRoutes);
const handleSubmit = async () =>{
  const res = await axios.post('/api/login', {
    email,
    password
  });
  console.log(res.data);
} 
//database connection and server start
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
app.post("api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (rows.length > 0) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



app.post("/login", async (req, res) => {

    const { email, password, rememberMe } = req.body;
    console.log('Received from frontend:', email, password, rememberMe);

    // Example response
    res.json({ message: 'Login data received' });
  
});

>>>>>>> Stashed changes
