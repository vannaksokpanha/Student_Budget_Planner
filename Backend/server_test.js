import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import express from 'express';

dotenv.config(); 
console.log("ENV TEST:", process.env.DB_USER);
//for intializing express app,cors 



const PORT = 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);

  res.json({ message: "Login successful" });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

