const router = require('express').Router();
const Training = require('../models/Training');
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  const { role, _id } = req.user;
  const filter = role === 'hr' ? {} : role === 'manager' ? { createdBy: _id } : { 'assignedTo.user': _id };
  res.json(await Training.find(filter).populate('assignedTo.user', 'name').populate('createdBy', 'name').sort('startDate'));
});

router.post('/', allow('hr', 'manager'), async (req, res) => {
  try {
    let { title, description, startDate, assignees = [] } = req.body;
    if (req.user.role === 'manager') {
      const team = (await User.find({ manager: req.user._id }).distinct('_id')).map(String);
      assignees = assignees.filter((id) => team.includes(String(id)));
    }
    const t = await Training.create({
      title, description, startDate, createdBy: req.user._id,
      assignedTo: assignees.map((user) => ({ user })),
    });
    res.status(201).json(t);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.patch('/:id/complete', async (req, res) => {
  const t = await Training.findById(req.params.id);
  const mine = t && t.assignedTo.find((a) => String(a.user) === String(req.user._id));
  if (!mine) return res.status(404).json({ message: 'This program is not assigned to you' });
  mine.completed = true;
  await t.save();
  res.json(t);
});

router.delete('/:id', allow('hr', 'manager'), async (req, res) => {
  const t = await Training.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Program not found' });
  if (req.user.role !== 'hr' && String(t.createdBy) !== String(req.user._id))
    return res.status(403).json({ message: 'Only the creator can delete this program' });
  await t.deleteOne();
  res.json({ message: 'Program removed' });
});

module.exports = router;
