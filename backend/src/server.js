const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const pgRoutes = require('./routes/pgs');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const communityRoutes = require('./routes/community');
const settingsRoutes = require('./routes/settings');

const app = express();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pg_finder';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:19006';

// Global middleware
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/pgs', pgRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/settings', settingsRoutes);

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Basic centralized error handler, can be expanded
  // Avoid leaking internal errors in production
  // eslint-disable-next-line no-console
  console.error('API error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`API server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

