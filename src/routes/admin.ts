import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { Post } from '../models/post';
import { User } from '../models/user';

const router = express.Router();

router.get('/reported-posts', authenticateToken, isAdmin, async (req, res) => {
  try {
    const reportedPosts = await Post.find({ reported: true })
      .populate('author', 'email')
      .sort('-createdAt');
    res.json(reportedPosts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reported posts' });
  }
});

router.post('/remove-post/:postId', authenticateToken, isAdmin, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: 'Post removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing post' });
  }
});

router.get('/user-stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    res.json({ totalUsers, newUsersToday });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user stats' });
  }
});

export default router;

