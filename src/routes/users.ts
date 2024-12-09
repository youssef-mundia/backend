import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { User } from '../models/user';
import { upload } from '../middleware/fileUpload';

const router = express.Router();

router.get('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('friends', 'name email profilePicture')
      .populate('followers', 'name email profilePicture')
      .populate('following', 'name email profilePicture');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

router.put('/profile', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, bio } = req.body;
    const profilePicture = req.file ? req.file.filename : undefined;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, profilePicture },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

router.post('/friend/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const friend = await User.findById(req.params.userId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.friends.includes(friend._id)) {
      user.friends = user.friends.filter(id => !id.equals(friend._id));
      friend.friends = friend.friends.filter(id => !id.equals(user._id));
    } else {
      user.friends.push(friend._id);
      friend.friends.push(user._id);
    }

    await user.save();
    await friend.save();

    res.json({ message: 'Friend list updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating friend list' });
  }
});

router.post('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userToFollow = await User.findById(req.params.userId);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.following.includes(userToFollow._id)) {
      user.following = user.following.filter(id => !id.equals(userToFollow._id));
      userToFollow.followers = userToFollow.followers.filter(id => !id.equals(user._id));
    } else {
      user.following.push(userToFollow._id);
      userToFollow.followers.push(user._id);
    }

    await user.save();
    await userToFollow.save();

    res.json({ message: 'Follow status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating follow status' });
  }
});

export default router;

