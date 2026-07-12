const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const PG = require('../models/PG');

async function createPayment(req, res, next) {
  try {
    const {
      bookingId, amount, commissionAmount, adminRevenue, method, transactionId, month, year, status,
    } = req.body;
    const payment = await Payment.create({
      bookingId,
      userId: req.user.id,
      amount,
      commissionAmount: commissionAmount || 0,
      adminRevenue: adminRevenue || amount,
      method,
      transactionId,
      month,
      year,
      status: status || 'paid',
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
