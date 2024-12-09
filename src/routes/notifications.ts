import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { Notification } from '../models/notification';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort('-createdAt')
      .populate('sender', 'email')
      .populate('relatedPost', 'content')
      .populate('relatedComment', 'content');
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

router.post('/mark-read', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications as read' });
  }
});

export default router;

