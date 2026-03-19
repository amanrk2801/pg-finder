const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    commissionAmount: { type: Number, default: 0 },
    adminRevenue: { type: Number, default: 0 },
    method: { type: String },
    transactionId: { type: String },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success',
    },
    month: Number,
    year: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model('Payment', paymentSchema);

