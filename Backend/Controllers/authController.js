const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');
const sequelize = require('../config/database.js'); 

// Seeded for every new user so the category picker isn't empty on first use
const DEFAULT_CATEGORIES = [
  { name: 'Rent', color: '#FF6B6B' },
  { name: 'Groceries', color: '#FFA94D' },
  { name: 'Utilities', color: '#FFD43B' },
  { name: 'Transport', color: '#69DB7C' },
  { name: 'Food & Drink', color: '#38D9A9' },
  { name: 'School Fees', color: '#4DABF7' },
  { name: 'Entertainment', color: '#748FFC' },
  { name: 'Other', color: '#868E96' }
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

const signup = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    // lowercase so Alice@mail.com and alice@mail.com are the same account
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    // server-side rules — never rely on frontend validation alone,
    // anyone can hit the API directly and skip it
    if (name.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: 'Email address is invalid' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // transaction: user + default categories succeed or fail together,
    // so a failed category insert can't leave a half-created account behind
    const user = await sequelize.transaction(async (t) => {
      const newUser = await User.create(
        { name, email, password: hashedPassword },
        { transaction: t }
      );
      await Category.bulkCreate(
        DEFAULT_CATEGORIES.map(c => ({ ...c, user_id: newUser.id })),
        { transaction: t }
      );
      return newUser;
    });

    // return a token so the frontend can log the user in immediately
    // instead of leaving them on the signup page
    const token = signToken(user);

    return res.status(201).json({
      message: 'Success',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // full error goes to the server log only — never send err.message
    // to the client, it can leak table/column names and internals
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);

    return res.json({
      message: 'Login Successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, signup };