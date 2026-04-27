const jwt = require('jsonwebtoken');
const { isInMemory, getStore } = require('../config/db');
const User = require('../models/User');

// Generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (isInMemory()) {
      // ─── In-memory auth ─────────────────────────────────────
      const store = getStore();
      let user = store.users.find((u) => u.username === username);

      if (!user) {
        // Auto-create for demo
        user = {
          _id: 'user_' + Date.now(),
          username,
          password,
          createdAt: new Date(),
        };
        store.users.push(user);
      }

      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      return res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    }

    // ─── MongoDB auth ──────────────────────────────────────
    let user = await User.findOne({ username });

    if (!user) {
      user = await User.create({ username, password });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { authUser };
