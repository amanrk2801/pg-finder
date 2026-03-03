const express = require('express');
const CommunityPost = require('../models/CommunityPost');
const auth = require('../middleware/auth');

const router = express.Router();

// Public: list posts
router.get('/', async (req, res, next) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// User: create post
router.post('/', auth(['user']), async (req, res, next) => {
  try {
    const post = await CommunityPost.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

