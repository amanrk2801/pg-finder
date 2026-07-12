const Booking = require('../models/Booking');
const PG = require('../models/PG');

async function createBooking(req, res, next) {
  try {
    const { pgId, monthlyRent } = req.body;

    const existingBooking = await Booking.findOne({ userId: req.user.id, pgId, status: 'active' });
    if (existingBooking) {
      return res.status(409).json({ message: 'You already have an active booking for this PG' });
    }

    const booking = await Booking.create({
      pgId,
      monthlyRent,
      userId: req.user.id,
      status: 'active',
    });

    const pg = await PG.findById(pgId);
    if (pg && pg.vacantBeds > 0) {
      const newVacantBeds = pg.vacantBeds - 1;
      const newOccupiedRooms = pg.occupiedRooms + (newVacantBeds % 3 === 0 ? 1 : 0);
      await PG.updateOne({ _id: pgId }, { $set: { vacantBeds: newVacantBeds, occupiedRooms: newOccupiedRooms } });
    }

    return res.status(201).json(booking);
  } catch (err) {
    return next(err);
  }
}

async function listMyBookings(req, res, next) {
  try {
    const filter = req.user.type === 'superadmin' ? {} : { userId: req.user.id };
    const bookings = await Booking.find(filter).lean();
    return res.json(bookings);
  } catch (err) {
    return next(err);
  }
}

async function listOwnerBookings(req, res, next) {
  try {
    const pgFilter = req.user.type === 'superadmin' ? {} : { adminId: req.user.id };
    const ownedPgIds = (await PG.find(pgFilter).select('_id').lean()).map((p) => p._id);

    const bookings = await Booking.find({ pgId: { $in: ownedPgIds } })
      .populate('userId', 'name email phone')
      .populate('pgId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(bookings);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createBooking,
  listMyBookings,
  listOwnerBookings,
};
