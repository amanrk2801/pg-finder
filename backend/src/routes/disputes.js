const express = require('express');
const Dispute = require('../models/Dispute');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /disputes:
 *   post:
 *     summary: Raise a dispute
 *     tags: [Disputes]
 */
router.post('/', auth(['user', 'admin', 'superadmin']), async (req, res, next) => {
  try {
    const dispute = await Dispute.create({
      ...req.body,
      userId: req.user.id,
      status: 'Open',
    });
    res.status(201).json(dispute);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /disputes/me:
 *   get:
 *     summary: Get user disputes
 *     tags: [Disputes]
 */
router.get('/me', auth(['user', 'admin', 'superadmin']), async (req, res, next) => {
  try {
    const filter = req.user.type === 'superadmin' ? {} : { userId: req.user.id };
    const disputes = await Dispute.find(filter).lean();
    res.json(disputes);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /disputes:
 *   get:
 *     summary: List all disputes
 *     tags: [Disputes]
 */
router.get('/', auth(['superadmin']), async (req, res, next) => {
  try {
    const disputes = await Dispute.find().populate('userId', 'email').lean();
    res.json(disputes);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /disputes/{id}:
 *   put:
 *     summary: Update dispute status
 *     tags: [Disputes]
 */
router.put('/:id', auth(['superadmin']), async (req, res, next) => {
  try {
    const { status } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(dispute);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
