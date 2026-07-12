const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/booking.controller');

const router = express.Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
 */
router.post('/', auth(['user', 'admin', 'superadmin']), controller.createBooking);

/**
 * @swagger
 * /bookings/me:
 *   get:
 *     summary: Get user bookings
 *     tags: [Bookings]
 */
router.get('/me', auth(['user', 'admin', 'superadmin']), controller.listMyBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update a booking (owner tenant or superadmin) — e.g. nextDueDate after a rent payment
 *     tags: [Bookings]
 */
router.put('/:id', auth(['user', 'admin', 'superadmin']), controller.updateBooking);

/**
 * @swagger
 * /bookings/owner:
 *   get:
 *     summary: Get bookings across PGs owned by the logged-in admin (or all, for superadmin)
 *     tags: [Bookings]
 */
router.get('/owner', auth(['admin', 'superadmin']), controller.listOwnerBookings);

module.exports = router;
