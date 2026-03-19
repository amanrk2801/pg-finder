const express = require('express');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
 */
router.post('/', auth(['user', 'admin', 'superadmin']), async (req, res, next) => {
  try {
    const { pgId, monthlyRent } = req.body;
    const booking = await Booking.create({
      pgId,
      monthlyRent,
      userId: req.user.id,
      status: 'active',
    });
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /bookings/me:
 *   get:
 *     summary: Get user bookings
 *     tags: [Bookings]
 */
router.get('/me', auth(['user', 'admin', 'superadmin']), async (req, res, next) => {
  try {
    const filter = req.user.type === 'superadmin' ? {} : { userId: req.user.id };
    const bookings = await Booking.find(filter).lean();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
