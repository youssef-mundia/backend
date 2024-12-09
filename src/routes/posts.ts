import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/fileUpload';
import { Post, Comment } from '../models/post';
import { Notification } from '../models/notification';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find({ author: { $in: req.user.university } })
      .populate('author', 'email')
      .populate('likes', 'email')
      .populate({
        path: 'comments',
        populate: [
          { path: 'author', select: 'email' },
          { path: 'likes', select: 'email' },
          {
            path: 'replies',
            populate: [
              { path: 'author', select: 'email' },
              { path: 'likes', select: 'email' }
            ]
          }
        ]
      })
      .sort('-createdAt');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

router.post('/', authenticateToken, upload.single('media'), async (req, res) => {
  const { content } = req.body;
  const media = req.file;
  try {
    const hashtags = content.match(/#[a-zA-Z0-9]+/g) || [];
    const post = new Post({
      content,
      author: req.user._id,
      mediaUrl: media ? media.filename : undefined,
      mediaType: media ? media.mimetype.split('/')[0] : undefined,
      hashtags: hashtags.map(tag => tag.slice(1))
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post' });
  }
});

router.post('/:postId/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter(id => !id.equals(req.user._id));
    } else {
      post.likes.push(req.user._id);
      // Create notification
      if (!post.author.equals(req.user._id)) {
        const notification = new Notification({
          recipient: post.author,
          type: 'like',
          content: `${req.user.email} liked your post`,
          relatedPost: post._id,
          sender: req.user._id
        });
        await notification.save();
      }
    }
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error liking post' });
  }
});

router.post('/:postId/comment', authenticateToken, async (req, res) => {
  const { content } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = new Comment({
      content,
      author: req.user._id
    });
    post.comments.push(comment);
    await post.save();

    // Create notification for new comment
    if (!post.author.equals(req.user._id)) {
      const notification = new Notification({
        recipient: post.author,
        type: 'comment',
        content: `${req.user.email} commented on your post`,
        relatedPost: post._id,
        sender: req.user._id
      });
      await notification.save();
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment' });
  }
});

router.post('/:postId/comment/:commentId/reply', authenticateToken, async (req, res) => {
  const { content } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const parentComment = post.comments.id(req.params.commentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const reply = new Comment({
      content,
      author: req.user._id
    });
    parentComment.replies.push(reply);
    await post.save();

    // Create notification for new reply
    if (!parentComment.author.equals(req.user._id)) {
      const notification = new Notification({
        recipient: parentComment.author,
        type: 'reply',
        content: `${req.user.email} replied to your comment`,
        relatedPost: post._id,
        sender: req.user._id
      });
      await notification.save();
    }

    res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ message: 'Error creating reply' });
  }
});

router.post('/:postId/comment/:commentId/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.likes.includes(req.user._id)) {
      comment.likes = comment.likes.filter(id => !id.equals(req.user._id));
    } else {
      comment.likes.push(req.user._id);
      // Create notification for comment like
      if (!comment.author.equals(req.user._id)) {
        const notification = new Notification({
          recipient: comment.author,
          type: 'like',
          content: `${req.user.email} liked your comment`,
          relatedPost: post._id,
          sender: req.user._id
        });
        await notification.save();
      }
    }
    await post.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error liking comment' });
  }
});

router.get('/trending', authenticateToken, async (req, res) => {
  try {
    const trendingHashtags = await Post.aggregate([
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(trendingHashtags);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending topics' });
  }
});

router.post('/:postId/report', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.reported = true;
    await post.save();
    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error reporting post' });
  }
});

router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    const posts = await Post.find({
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { hashtags: { $in: [new RegExp(query as string, 'i')] } }
      ]
    })
      .populate('author', 'name email profilePicture')
      .sort('-createdAt');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error searching posts' });
  }
});

export default router;

