const express = require('express');
const PG = require('../models/PG');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /pgs:
 *   get:
 *     summary: List PGs (Role-based visibility)
 *     tags: [PGs]
 */
router.get('/', auth(['user', 'admin', 'superadmin'], true), async (req, res, next) => {
  try {
    const { city, minRent, maxRent } = req.query;
    
    let filter = { status: 'approved' };

    if (req.user) {
      if (req.user.type === 'superadmin') {
        filter = {};
      } else if (req.user.type === 'admin') {
        filter = {
          $or: [
            { status: 'approved' },
            { adminId: req.user.id }
          ]
        };
      }
    }

    if (city) filter.city = city;
    if (minRent) filter.rent = { ...filter.rent, $gte: Number(minRent) };
    if (maxRent) filter.rent = { ...filter.rent, $lte: Number(maxRent) };

    const pgs = await PG.find(filter).lean();
    res.json(pgs);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /pgs/{id}:
 *   get:
 *     summary: Get PG by ID
 *     tags: [PGs]
 */
router.get('/:id', async (req, res, next) => {
  try {
    const pg = await PG.findById(req.params.id).lean();
    if (!pg) return res.status(404).json({ message: 'PG not found' });
    return res.json(pg);
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /pgs:
 *   post:
 *     summary: Create a new PG (Admin only)
 *     tags: [PGs]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth(['admin']), async (req, res, next) => {
  try {
    const data = { ...req.body, adminId: req.user.id, status: 'pending' };
    console.log(`[PG] Creating new PG for admin ${req.user.id}`);
    const pg = await PG.create(data);
    res.status(201).json(pg);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /pgs/{id}:
 *   put:
 *     summary: Update a PG
 *     tags: [PGs]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth(['admin', 'superadmin']), async (req, res, next) => {
  try {
    const { id: pgId } = req.params;
    const adminId = req.user.id;

    console.log(`[PG] Update request for ${pgId} by ${adminId} (${req.user.type})`);

    const filter = req.user.type === 'superadmin' 
      ? { _id: pgId } 
      : { _id: pgId, adminId: adminId };

    const pg = await PG.findOneAndUpdate(
      filter,
      { $set: req.body }, // Use $set to be explicit
      { new: true, runValidators: true },
    );

    if (!pg) {
      console.warn(`[PG] Update failed: PG ${pgId} not found or not owned by ${adminId}`);
      return res.status(404).json({ message: 'PG not found or unauthorized' });
    }

    console.log(`[PG] Update successful for ${pgId}`);
    return res.json(pg);
  } catch (err) {
    console.error(`[PG] Update Error:`, err.message);
    return next(err);
  }
});

module.exports = router;
