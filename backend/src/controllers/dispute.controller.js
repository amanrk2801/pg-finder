const Dispute = require('../models/Dispute');

async function createDispute(req, res, next) {
  try {
    const dispute = await Dispute.create({
      ...req.body,
      userId: req.user.id,
      status: 'Open',
    });
    return res.status(201).json(dispute);
  } catch (err) {
    return next(err);
  }
}

async function listMyDisputes(req, res, next) {
  try {
    const filter = req.user.type === 'superadmin' ? {} : { userId: req.user.id };
    const disputes = await Dispute.find(filter).lean();
    return res.json(disputes);
  } catch (err) {
    return next(err);
  }
}

async function listAllDisputes(req, res, next) {
  try {
    const disputes = await Dispute.find().populate('userId', 'email').lean();
    return res.json(disputes);
  } catch (err) {
    return next(err);
  }
}

async function updateDisputeStatus(req, res, next) {
  try {
    const { status } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(req.params.id, { status }, { new: true });
    return res.json(dispute);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createDispute,
  listMyDisputes,
  listAllDisputes,
  updateDisputeStatus,
};
