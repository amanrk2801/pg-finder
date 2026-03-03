const express = require('express');
const PG = require('../models/PG');
const auth = require('../middleware/auth');

const router = express.Router();

// Public: list all approved PGs
router.get('/', async (req, res, next) => {
  try {
    const { city, minRent, maxRent } = req.query;
    const filter = { status: 'approved' };

    if (city) filter.city = city;
    if (minRent) filter.rent = { ...filter.rent, $gte: Number(minRent) };
    if (maxRent) filter.rent = { ...filter.rent, $lte: Number(maxRent) };

    const pgs = await PG.find(filter).lean();
    res.json(pgs);
  } catch (err) {
    next(err);
  }
});

// Public: get single PG
router.get('/:id', async (req, res, next) => {
  try {
    const pg = await PG.findById(req.params.id).lean();
    if (!pg) return res.status(404).json({ message: 'PG not found' });
    return res.json(pg);
  } catch (err) {
    return next(err);
  }
});

// Admin: create PG
router.post('/', auth(['admin']), async (req, res, next) => {
  try {
    const data = { ...req.body, adminId: req.user.id };
    const pg = await PG.create(data);
    res.status(201).json(pg);
  } catch (err) {
    next(err);
  }
});

// Admin: update PG they own
router.put('/:id', auth(['admin']), async (req, res, next) => {
  try {
    const pg = await PG.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user.id },
      req.body,
      { new: true },
    );
    if (!pg) return res.status(404).json({ message: 'PG not found or not owned by admin' });
    return res.json(pg);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

