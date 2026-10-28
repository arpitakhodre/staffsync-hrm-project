const router = require('express').Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const today = require('../utils/today');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

router.post('/check-in', async (req, res) => {
  const date = today();
  if (await Attendance.findOne({ employee: req.user._id, date }))
    return res.status(409).json({ message: 'You already checked in today' });
  res.status(201).json(await Attendance.create({ employee: req.user._id, date, checkIn: new Date() }));
});

router.post('/check-out', async (req, res) => {
  const rec = await Attendance.findOne({ employee: req.user._id, date: today() });
  if (!rec) return res.status(400).json({ message: 'Check in first, then check out' });
  if (rec.checkOut) return res.status(409).json({ message: 'You already checked out today' });
  rec.checkOut = new Date();
  await rec.save();
  res.json(rec);
});

router.get('/today', async (req, res) => {
  res.json(await Attendance.findOne({ employee: req.user._id, date: today() }));
});

router.get('/mine', async (req, res) => {
  res.json(await Attendance.find({ employee: req.user._id }).sort('-date').limit(31));
});

router.get('/team', allow('hr', 'manager'), async (req, res) => {
  const date = req.query.date || today();
  const team = req.user.role === 'hr'
    ? await User.find({ _id: { $ne: req.user._id } }).distinct('_id')
    : await User.find({ manager: req.user._id }).distinct('_id');
  res.json(await Attendance.find({ date, employee: { $in: team } }).populate('employee', 'name department').sort('checkIn'));
});

module.exports = router;
