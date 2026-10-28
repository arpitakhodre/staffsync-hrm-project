require('dotenv').config();
process.env.JWT_SECRET ||= 'dev-only-secret-change-me';

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json());

// Connect once and reuse (works locally and on serverless hosts like Vercel)
let connecting;
app.use(async (_req, _res, next) => {
  try {
    connecting ||= connectDB();
    await connecting;
    next();
  } catch (e) {
    connecting = null;
    next(e);
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/training', require('./routes/training'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ message: 'Server could not reach the database. Try again.' });
});

if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`StaffSync API running on port ${port}`));
}

module.exports = app;