const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = (u) => ({
  id: u._id, name: u.name, email: u.email, role: u.role,
  department: u.department, designation: u.designation,
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: 'That email is already registered' });
    const user = await User.create({ name, email, password, role: 'employee' });
    res.status(201).json({ token: sign(user), user: pub(user) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email = '', password = '' } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matches(password)))
      return res.status(401).json({ message: 'Email or password is incorrect' });
    res.json({ token: sign(user), user: pub(user) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/me', protect, (req, res) => res.json(pub(req.user)));

module.exports = router;
