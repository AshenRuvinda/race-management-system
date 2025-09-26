const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  const { username, password, role } = req.body;
  
  try {
    // Validation
    if (!username || !password || !role) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }

    if (!['admin', 'owner'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role specified' });
    }

    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({ username, password, role });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();

    // Create JWT token
    const payload = { 
      user: { 
        id: user.id, 
        role: user.role,
        username: user.username
      } 
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(201).json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Validation
    if (!username || !password) {
      return res.status(400).json({ msg: 'Please provide username and password' });
    }

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = { 
      user: { 
        id: user.id, 
        role: user.role,
        username: user.username
      } 
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
};