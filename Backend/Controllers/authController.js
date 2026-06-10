const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/connectDb');

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const [existingUsers] = await db.query('SELECT id FROM Users WHERE email = ? LIMIT 1', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO Users (`name`,`email`,`password`) VALUES (?,?,?)';
    const values = [name, email, hashedPassword];
    
    await db.query(sql, values);
    return res.json({ message: 'Success' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' });
    }

    console.error(err);
    return res.status(500).json({ message: 'Error', detail: err.message });
  }
};

const login = async (req,res) => {
  try {

    const {email,password} = req.body;

    if (!email || !password){
      return res.status(400).json({ message: 'Email and password are required' })
    }
    const [users] = await db.query('SELECT * FROM Users WHERE email = ? LIMIT 1' , [email])

    if (users.length === 0){
      return res.status(401).json({message:"Invalid email or password"})
    }

    const user = users[0]  // extracts the actual user object from the array that MySQL returns
    const isPasswordValid = await bcrypt.compare(password , user.password);
    
    if(!isPasswordValid){
      return res.status(401).json({message: 'Invalid email or password'})
    }

    const token = jwt.sign(  // automatically gener token for each user 
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    )


    return res.json({
      message : 'Login Sucessful',
      token,
      user : {id: user.id , name: user.name , email: user.email}
    })
  }
  catch (err) {
    console.error(err)
    return res.status(500).json({message:"Server error" , detail: err.message})
  }
}
module.exports = { login, signup };

