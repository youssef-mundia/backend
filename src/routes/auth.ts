import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, university, name } = req.body;

  // Validate university email domain
  const emailDomain = email.split('@')[1];
  if (emailDomain !== university + '.edu') {
    return res.status(400).json({ message: 'Invalid university email domain' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      university,
      name
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string);
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

export default router;

