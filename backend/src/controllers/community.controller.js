const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');

async function listPosts(req, res, next) {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 }).lean();

    // Backfill authorName for posts created before the field existed.
    const missingAuthorIds = [...new Set(
      posts.filter((p) => !p.authorName).map((p) => String(p.userId)),
    )];
    if (missingAuthorIds.length) {
      const authors = await User.find({ _id: { $in: missingAuthorIds } }).select('name email').lean();
      const authorById = new Map(authors.map((a) => [String(a._id), a.name || a.email || 'Unknown User']));
      posts.forEach((p) => {
        if (!p.authorName) p.authorName = authorById.get(String(p.userId)) || 'Unknown User';
      });
    }

    return res.json(posts);
  } catch (err) {
    return next(err);
  }
}

async function createPost(req, res, next) {
  try {
    const author = await User.findById(req.user.id).select('name email');
    const post = await CommunityPost.create({
      ...req.body,
      userId: req.user.id,
      authorName: author?.name || author?.email || 'Unknown User',
    });
    return res.status(201).json(post);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listPosts, createPost };
