const Booking = require('../models/Booking');
const PG = require('../models/PG');

async function createBooking(req, res, next) {
  try {
    const { pgId } = req.body;

    const existingBooking = await Booking.findOne({ userId: req.user.id, pgId, status: 'active' });
    if (existingBooking) {
      return res.status(409).json({ message: 'You already have an active booking for this PG' });
    }

    // Atomically reserve a bed: the conditional update only succeeds while a bed
    // is actually free, so two users can't both take the last one.
    const pg = await PG.findOneAndUpdate(
      { _id: pgId, status: 'approved', vacantBeds: { $gt: 0 } },
      { $inc: { vacantBeds: -1 } },
      { new: true },
    );
    if (!pg) {
      return res.status(409).json({ message: 'No beds available at this PG' });
    }

    if (pg.vacantBeds % 3 === 0) {
      await PG.updateOne({ _id: pgId }, { $inc: { occupiedRooms: 1 } });
    }

    let booking;
    try {
      booking = await Booking.create({
        pgId,
        monthlyRent: pg.rent, // server-authoritative — never trust the client's rent
        userId: req.user.id,
        status: 'active',
      });
    } catch (createErr) {
      // Release the reserved bed if booking creation fails.
      await PG.updateOne({ _id: pgId }, { $inc: { vacantBeds: 1 } });
      throw createErr;
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

async function updateBooking(req, res, next) {
  try {
    const { nextDueDate, status } = req.body;
    const filter = req.user.type === 'superadmin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user.id };

    const update = {};
    if (nextDueDate !== undefined) update.nextDueDate = nextDueDate;
    if (status !== undefined) update.status = status;

    const booking = await Booking.findOneAndUpdate(filter, { $set: update }, { new: true, runValidators: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found or unauthorized' });
    return res.json(booking);
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
  updateBooking,
};
