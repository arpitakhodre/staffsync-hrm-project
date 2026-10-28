const router = require('express').Router();
const Announcement = require('../models/Announcement');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  res.json(await Announcement.find().populate('postedBy', 'name').sort('-createdAt'));
});

router.post('/', allow('hr'), async (req, res) => {
  try {
    const a = await Announcement.create({ title: req.body.title, body: req.body.body, postedBy: req.user._id });
    res.status(201).json(a);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/:id', allow('hr'), async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ message: 'Announcement removed' });
});

module.exports = router;
