const LeaveRequest = require('../models/LeaveRequest');

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

async function updateLeaveStatus(req, res, next) {
  try {
    const { status } = req.body;
    const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    return res.json(leave);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createLeave,
  listMyLeaves,
  listLeavesByPg,
  updateLeaveStatus,
};
