import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  mediaUrl: { type: String },
  mediaType: { type: String, enum: ['text', 'image', 'audio', 'video'] },
  iv: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Message = mongoose.model('Message', messageSchema);

