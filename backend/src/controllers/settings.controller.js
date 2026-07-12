const Settings = require('../models/Settings');

async function getSettings(req, res, next) {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ platformFee: 5 });
    }
    return res.json(settings);
  } catch (err) {
    return next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const { platformFee } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ platformFee });
    } else {
      settings.platformFee = platformFee;
      await settings.save();
    }
    return res.json(settings);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getSettings, updateSettings };
