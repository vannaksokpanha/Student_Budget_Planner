const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

module.exports = { getProfile };
