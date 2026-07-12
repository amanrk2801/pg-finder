const express = require('express');

const authRoutes = require('./auth.routes');
const pgRoutes = require('./pg.routes');
const bookingRoutes = require('./booking.routes');
const paymentRoutes = require('./payment.routes');
const communityRoutes = require('./community.routes');
const settingsRoutes = require('./settings.routes');
const reviewRoutes = require('./review.routes');
const messRoutes = require('./mess.routes');
const leaveRoutes = require('./leave.routes');
const disputeRoutes = require('./dispute.routes');
const uploadRoutes = require('./upload.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/pgs', pgRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/community', communityRoutes);
router.use('/settings', settingsRoutes);
router.use('/reviews', reviewRoutes);
router.use('/mess', messRoutes);
router.use('/leaves', leaveRoutes);
router.use('/disputes', disputeRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;
