const router = require('express').Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

router.post('/', async (req, res) => {
  try {
    const { type, from, to, reason } = req.body;
    if (!from || !to || !reason) return res.status(400).json({ message: 'Dates and a reason are required' });
    if (new Date(to) < new Date(from)) return res.status(400).json({ message: 'End date cannot be before the start date' });
    const leave = await Leave.create({ employee: req.user._id, type, from, to, reason });
    res.status(201).json(leave);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/mine', async (req, res) => {
  res.json(await Leave.find({ employee: req.user._id }).populate('reviewedBy', 'name').sort('-createdAt'));
});

// Requests this person is allowed to review
router.get('/review', allow('hr', 'manager'), async (req, res) => {
  const team = req.user.role === 'hr'
    ? await User.find({ _id: { $ne: req.user._id } }).distinct('_id')
    : await User.find({ manager: req.user._id }).distinct('_id');
  res.json(await Leave.find({ employee: { $in: team } }).populate('employee', 'name department').populate('reviewedBy', 'name').sort('-createdAt'));
});

router.patch('/:id/status', allow('hr', 'manager'), async (req, res) => {
  const { status, note } = req.body;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Status must be approved or rejected' });
  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ message: 'Leave request not found' });
  if (leave.status !== 'pending') return res.status(409).json({ message: 'This request was already reviewed' });
  if (String(leave.employee) === String(req.user._id)) return res.status(403).json({ message: 'You cannot review your own request' });
  if (req.user.role === 'manager') {
    const emp = await User.findById(leave.employee);
    if (!emp || String(emp.manager) !== String(req.user._id))
      return res.status(403).json({ message: 'This person is not on your team' });
  }
  leave.status = status;
  leave.note = note;
  leave.reviewedBy = req.user._id;
  await leave.save();
  res.json(leave);
});

module.exports = router;
