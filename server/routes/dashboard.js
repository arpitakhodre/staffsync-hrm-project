const router = require('express').Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Training = require('../models/Training');
const today = require('../utils/today');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const u = req.user;
    const date = today();
    const out = { role: u.role };
    if (u.role === 'employee') {
      out.pendingLeaves = await Leave.countDocuments({ employee: u._id, status: 'pending' });
      const a = await Attendance.findOne({ employee: u._id, date });
      out.today = a ? (a.checkOut ? 'Checked out' : 'Checked in') : 'Not checked in';
      out.openTraining = await Training.countDocuments({ assignedTo: { $elemMatch: { user: u._id, completed: false } } });
    } else {
      const team = u.role === 'hr'
        ? await User.find({ _id: { $ne: u._id } }).distinct('_id')
        : await User.find({ manager: u._id }).distinct('_id');
      out.people = team.length;
      out.pendingReviews = await Leave.countDocuments({ employee: { $in: team }, status: 'pending' });
      out.presentToday = await Attendance.countDocuments({ employee: { $in: team }, date });
      out.programs = await Training.countDocuments(u.role === 'hr' ? {} : { createdBy: u._id });
    }
    res.json(out);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
