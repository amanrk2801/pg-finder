const express = require('express');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

// User: create booking for a PG
router.post('/', auth(['user']), async (req, res, next) => {
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

// User: list own bookings
router.get('/me', auth(['user']), async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).lean();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

