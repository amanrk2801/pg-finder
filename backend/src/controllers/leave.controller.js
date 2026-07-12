const LeaveRequest = require('../models/LeaveRequest');
const Booking = require('../models/Booking');
const PG = require('../models/PG');

async function createLeave(req, res, next) {
  try {
    const leave = await LeaveRequest.create({
      ...req.body,
      userId: req.user.id,
    });
    return res.status(201).json(leave);
  } catch (err) {
    return next(err);
  }
}

async function listMyLeaves(req, res, next) {
  try {
    const filter = req.user.type === 'superadmin' ? {} : { userId: req.user.id };
    const requests = await LeaveRequest.find(filter).lean();
    return res.json(requests);
  } catch (err) {
    return next(err);
  }
}

async function listLeavesByPg(req, res, next) {
  try {
    const requests = await LeaveRequest.find({ pgId: req.params.pgId }).populate('userId', 'name').lean();
    return res.json(requests);
  } catch (err) {
    return next(err);
  }
}

async function listOwnerLeaves(req, res, next) {
  try {
    const pgFilter = req.user.type === 'superadmin' ? {} : { adminId: req.user.id };
    const ownedPgIds = (await PG.find(pgFilter).select('_id').lean()).map((p) => p._id);

    const requests = await LeaveRequest.find({ pgId: { $in: ownedPgIds } })
      .populate('userId', 'name email phone')
      .populate('pgId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(requests);
  } catch (err) {
    return next(err);
  }
}

async function updateLeaveStatus(req, res, next) {
  try {
    const { status } = req.body;
    const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (leave && status === 'approved') {
      await Booking.updateOne({ _id: leave.bookingId }, { $set: { status: 'completed' } });

      const pg = await PG.findById(leave.pgId);
      if (pg) {
        const cap = pg.totalBeds > 0 ? pg.totalBeds : pg.vacantBeds + 1;
        const newVacantBeds = Math.min(pg.vacantBeds + 1, cap);
        const newOccupiedRooms = Math.max(0, pg.occupiedRooms - (newVacantBeds % 3 === 1 ? 1 : 0));
        await PG.updateOne({ _id: leave.pgId }, { $set: { vacantBeds: newVacantBeds, occupiedRooms: newOccupiedRooms } });
      }
    }

    return res.json(leave);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createLeave,
  listMyLeaves,
  listLeavesByPg,
  listOwnerLeaves,
  updateLeaveStatus,
};
