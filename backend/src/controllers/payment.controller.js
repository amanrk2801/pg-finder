const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const PG = require('../models/PG');
const Settings = require('../models/Settings');

async function createPayment(req, res, next) {
  try {
    const {
      bookingId, amount, method, transactionId, month, year,
    } = req.body;

    // Amounts are computed server-side from the booking — never trusted from the client.
    const booking = await Booking.findOne({ _id: bookingId, userId: req.user.id }).lean();
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not yours' });
    }

    const settings = await Settings.findOne().lean();
    const feePct = settings?.platformFee ?? 5;
    const monthlyRent = booking.monthlyRent;
    const platformFee = Math.round(monthlyRent * (feePct / 100) * 100) / 100;

    const expectedMonthly = monthlyRent;
    const expectedInitial = monthlyRent + platformFee;
    const paid = Number(amount);
    const isInitial = Math.abs(paid - expectedInitial) < 1;
    const isMonthly = Math.abs(paid - expectedMonthly) < 1;

    if (!isInitial && !isMonthly) {
      return res.status(400).json({
        message: `Invalid payment amount. Expected ₹${expectedMonthly} (rent) or ₹${expectedInitial} (booking + fee)`,
      });
    }

    const parsedMonth = Number(month);
    const parsedYear = Number(year);
    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12 || !Number.isInteger(parsedYear)) {
      return res.status(400).json({ message: 'Invalid payment month/year' });
    }

    const payment = await Payment.create({
      bookingId,
      userId: req.user.id,
      amount: paid,
      commissionAmount: platformFee,
      adminRevenue: isInitial ? monthlyRent : paid,
      method,
      transactionId,
      month: parsedMonth,
      year: parsedYear,
      status: 'paid',
    });
    return res.status(201).json(payment);
  } catch (err) {
    return next(err);
  }
}

async function listMyPayments(req, res, next) {
  try {
    const filter = req.user.type === 'superadmin' ? {} : { userId: req.user.id };
    const payments = await Payment.find(filter).lean();
    return res.json(payments);
  } catch (err) {
    return next(err);
  }
}

async function listOwnerPayments(req, res, next) {
  try {
    const pgFilter = req.user.type === 'superadmin' ? {} : { adminId: req.user.id };
    const ownedPgIds = (await PG.find(pgFilter).select('_id').lean()).map((p) => p._id);
    const ownedBookingIds = (await Booking.find({ pgId: { $in: ownedPgIds } }).select('_id').lean()).map((b) => b._id);

    const payments = await Payment.find({ bookingId: { $in: ownedBookingIds } })
      .populate('userId', 'name email phone')
      .populate({ path: 'bookingId', populate: { path: 'pgId', select: 'name' } })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(payments);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createPayment,
  listMyPayments,
  listOwnerPayments,
};
