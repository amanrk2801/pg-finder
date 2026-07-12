const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');

async function listPosts(req, res, next) {
  try {
    const { limit, skip } = req.query;
    let query = CommunityPost.find().sort({ createdAt: -1 });
    if (skip) query = query.skip(Math.max(0, Number(skip) || 0));
    if (limit) query = query.limit(Math.min(100, Math.max(1, Number(limit) || 100)));

    const posts = await query.lean();

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

async function updatePost(req, res, next) {
  try {
    const { status, title, description, contactInfo } = req.body;
    const updates = {};
    if (status !== undefined) updates.status = status;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (contactInfo !== undefined) updates.contactInfo = contactInfo;

    const post = await CommunityPost.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true },
    );
    if (!post) return res.status(404).json({ message: 'Post not found or not yours' });
    return res.json(post);
  } catch (err) {
    return next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const filter = req.user.type === 'superadmin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user.id };

    const post = await CommunityPost.findOneAndDelete(filter);
    if (!post) return res.status(404).json({ message: 'Post not found or not yours' });
    return res.json({ message: 'Post deleted', id: req.params.id });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listPosts, createPost, updatePost, deletePost };
