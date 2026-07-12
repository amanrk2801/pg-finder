const PG = require('../models/PG');

async function listPgs(req, res, next) {
  try {
    const { city, minRent, maxRent, limit, skip } = req.query;

    let filter = { status: 'approved' };

    if (req.user) {
      if (req.user.type === 'superadmin') {
        filter = {};
      } else if (req.user.type === 'admin') {
        filter = {
          $or: [
            { status: 'approved' },
            { adminId: req.user.id },
          ],
        };
      }
    }

    if (city) filter.city = city;
    if (minRent) filter.rent = { ...filter.rent, $gte: Number(minRent) };
    if (maxRent) filter.rent = { ...filter.rent, $lte: Number(maxRent) };

    let query = PG.find(filter).sort({ createdAt: -1 });
    if (skip) query = query.skip(Math.max(0, Number(skip) || 0));
    if (limit) query = query.limit(Math.min(100, Math.max(1, Number(limit) || 100)));

    const pgs = await query.lean();
    return res.json(pgs);
  } catch (err) {
    return next(err);
  }
}

async function getPgById(req, res, next) {
  try {
    const pg = await PG.findById(req.params.id).lean();
    if (!pg) return res.status(404).json({ message: 'PG not found' });
    return res.json(pg);
  } catch (err) {
    return next(err);
  }
}

async function createPg(req, res, next) {
  try {
    const data = { ...req.body, adminId: req.user.id, status: 'pending' };
    console.log(`[PG] Creating new PG for admin ${req.user.id}`);
    const pg = await PG.create(data);
    return res.status(201).json(pg);
  } catch (err) {
    return next(err);
  }
}

async function updatePg(req, res, next) {
  try {
    const { id: pgId } = req.params;
    const adminId = req.user.id;

    console.log(`[PG] Update request for ${pgId} by ${adminId} (${req.user.type})`);

    const filter = req.user.type === 'superadmin'
      ? { _id: pgId }
      : { _id: pgId, adminId };

    const updates = { ...req.body };
    if (req.user.type !== 'superadmin') {
      // Only superadmin may change approval status or reassign ownership.
      delete updates.status;
      delete updates.adminId;
    }

    const pg = await PG.findOneAndUpdate(
      filter,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!pg) {
      console.warn(`[PG] Update failed: PG ${pgId} not found or not owned by ${adminId}`);
      return res.status(404).json({ message: 'PG not found or unauthorized' });
    }

    console.log(`[PG] Update successful for ${pgId}`);
    return res.json(pg);
  } catch (err) {
    console.error('[PG] Update Error:', err.message);
    return next(err);
  }
}

async function deletePg(req, res, next) {
  try {
    const pg = await PG.findByIdAndDelete(req.params.id);
    if (!pg) return res.status(404).json({ message: 'PG not found' });
    return res.json({ message: 'PG deleted', id: req.params.id });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listPgs,
  getPgById,
  createPg,
  updatePg,
  deletePg,
};
