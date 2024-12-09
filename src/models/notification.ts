import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['like', 'comment', 'reply', 'message'] },
  content: { type: String, required: true },
  relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  relatedComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Notification = mongoose.model('Notification', notificationSchema);

