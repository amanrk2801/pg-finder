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
const reviewRoutes = require('./routes/reviews');
const messRoutes = require('./routes/mess');
const leaveRoutes = require('./routes/leaves');
const disputeRoutes = require('./routes/disputes');
const { swaggerUi, specs } = require('./swagger');

const app = express();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pg_finder';

// Global middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan('dev'));

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

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
app.use('/api/reviews', reviewRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/disputes', disputeRoutes);

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('API error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API server listening on port ${PORT} (Accessible on local network)`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
