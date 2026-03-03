const express = require('express');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

const router = express.Router();

// Get settings (public/read-only)
router.get('/', async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ platformFee: 5 });
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

// Superadmin: update settings
router.put('/', auth(['superadmin']), async (req, res, next) => {
  try {
    const { platformFee } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ platformFee });
    } else {
      settings.platformFee = platformFee;
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

