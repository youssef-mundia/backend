import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { Message } from '../models/message';
import { upload } from '../middleware/fileUpload';

const router = express.Router();

router.get('/:recipientId', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, recipientId: req.params.recipientId },
        { senderId: req.params.recipientId, recipientId: req.user.id }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

router.post('/send', authenticateToken, upload.single('media'), async (req, res) => {
  const { recipientId, content } = req.body;
  const media = req.file;

  try {
    const message = new Message({
      senderId: req.user.id,
      recipientId,
      content,
      mediaUrl: media ? media.filename : undefined,
      mediaType: media ? media.mimetype.split('/')[0] : 'text'
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
});

export default router;

