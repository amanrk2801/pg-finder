const express = require('express');
const LeaveRequest = require('../models/LeaveRequest');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /leaves:
 *   post:
 *     summary: Request leave
 *     tags: [Leaves]
 */
router.post('/', auth(['user', 'admin', 'superadmin']), async (req, res, next) => {
  try {
    const leave = await LeaveRequest.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(leave);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /leaves/me:
 *   get:
 *     summary: Get user leave requests
 *     tags: [Leaves]
 */
router.get('/me', auth(['user', 'admin', 'superadmin']), async (req, res, next) => {
  try {
    const filter = req.user.type === 'superadmin' ? {} : { userId: req.user.id };
    const requests = await LeaveRequest.find(filter).lean();
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /leaves/pg/{pgId}:
 *   get:
 *     summary: List leave requests for a PG
 *     tags: [Leaves]
 */
router.get('/pg/:pgId', auth(['admin', 'superadmin']), async (req, res, next) => {
  try {
    const requests = await LeaveRequest.find({ pgId: req.params.pgId }).populate('userId', 'name').lean();
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /leaves/{id}:
 *   put:
 *     summary: Update leave status
 *     tags: [Leaves]
 */
router.put('/:id', auth(['admin', 'superadmin']), async (req, res, next) => {
  try {
    const { status } = req.body;
    const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(leave);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
