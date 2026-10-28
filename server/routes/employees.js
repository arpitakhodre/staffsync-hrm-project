const router = require('express').Router();
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

// HR sees everyone, a manager sees their own team
router.get('/', allow('hr', 'manager'), async (req, res) => {
  const filter = req.user.role === 'hr' ? {} : { manager: req.user._id };
  const people = await User.find(filter).populate('manager', 'name').sort('name');
  res.json(people);
});

router.get('/managers', allow('hr'), async (req, res) => {
  res.json(await User.find({ role: 'manager' }).select('name').sort('name'));
});

router.post('/', allow('hr'), async (req, res) => {
  try {
    const { name, email, password, role, department, designation, phone, manager } = req.body;
    if (!password) return res.status(400).json({ message: 'A starting password is required' });
    const u = await User.create({ name, email, password, role, department, designation, phone, manager: manager || null });
    const out = u.toObject();
    delete out.password;
    res.status(201).json(out);
  } catch (e) {
    res.status(e.code === 11000 ? 409 : 400).json({ message: e.code === 11000 ? 'That email is already in use' : e.message });
  }
});

router.put('/:id', allow('hr'), async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'Employee not found' });
    ['name', 'email', 'role', 'department', 'designation', 'phone'].forEach((k) => {
      if (req.body[k]) u[k] = req.body[k];
    });
    if (req.body.manager !== undefined) u.manager = req.body.manager || null;
    if (req.body.password) u.password = req.body.password;
    await u.save();
    const out = u.toObject();
    delete out.password;
    res.json(out);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/:id', allow('hr'), async (req, res) => {
  if (String(req.params.id) === String(req.user._id))
    return res.status(400).json({ message: 'You cannot delete your own account' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Employee removed' });
});

module.exports = router;
