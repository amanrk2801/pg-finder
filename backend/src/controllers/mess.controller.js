const MessMenu = require('../models/MessMenu');

async function listMenus(req, res, next) {
  try {
    const menus = await MessMenu.find().lean();
    return res.json(menus);
  } catch (err) {
    return next(err);
  }
}

async function getMenuByPg(req, res, next) {
  try {
    const menu = await MessMenu.findOne({ pgId: req.params.pgId }).lean();
    return res.json(menu);
  } catch (err) {
    return next(err);
  }
}

async function upsertMenu(req, res, next) {
  try {
    const { pgId, menu } = req.body;
    const updatedMenu = await MessMenu.findOneAndUpdate(
      { pgId },
      { $set: { ...menu, pgId } },
      { upsert: true, new: true, runValidators: true },
    );
    return res.json(updatedMenu);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listMenus, getMenuByPg, upsertMenu };
