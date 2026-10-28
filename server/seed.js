// Fills the database with demo accounts. Run: npm run seed
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Leave = require('./models/Leave');
const Attendance = require('./models/Attendance');
const Announcement = require('./models/Announcement');
const Training = require('./models/Training');
const today = require('./utils/today');

(async () => {
  await connectDB();
  await Promise.all([User, Leave, Attendance, Announcement, Training].map((m) => m.deleteMany({})));

  const pw = 'Pass@123';
  const hr = await User.create({ name: 'Anita Verma', email: 'hr@staffsync.com', password: pw, role: 'hr', department: 'Human Resources', designation: 'HR Lead' });
  const mgr = await User.create({ name: 'Rohan Mehta', email: 'manager@staffsync.com', password: pw, role: 'manager', department: 'Engineering', designation: 'Engineering Manager' });
  const emps = await User.create([
    { name: 'Priya Nair', email: 'priya@staffsync.com', password: pw, department: 'Engineering', designation: 'Frontend Developer', manager: mgr._id },
    { name: 'Imran Sheikh', email: 'imran@staffsync.com', password: pw, department: 'Engineering', designation: 'Backend Developer', manager: mgr._id },
    { name: 'Neha Joshi', email: 'employee@staffsync.com', password: pw, department: 'Engineering', designation: 'QA Engineer', manager: mgr._id },
  ]);

  const day = 86400000;
  await Leave.create([
    { employee: emps[0]._id, type: 'casual', from: Date.now() + 3 * day, to: Date.now() + 4 * day, reason: 'Family function' },
    { employee: emps[1]._id, type: 'sick', from: Date.now() - 5 * day, to: Date.now() - 4 * day, reason: 'Fever', status: 'approved', reviewedBy: mgr._id },
  ]);
  await Attendance.create({ employee: emps[0]._id, date: today(), checkIn: new Date() });
  await Announcement.create({ title: 'Welcome to StaffSync', body: 'Apply for leave, mark attendance and track training from one place.', postedBy: hr._id });
  await Training.create({ title: 'Secure coding basics', description: 'A two-hour session on common web vulnerabilities.', startDate: Date.now() + 7 * day, createdBy: mgr._id, assignedTo: emps.map((e) => ({ user: e._id })) });

  console.log('Seeded. Every account uses password:', pw);
  console.log('hr@staffsync.com | manager@staffsync.com | employee@staffsync.com');
  process.exit(0);
})();
