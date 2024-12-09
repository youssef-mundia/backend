import { Server, Socket } from 'socket.io';
import { Message } from './models/message';
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text: string) {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text: { iv: string, encryptedData: string }) {
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export const setupSocketIO = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('A user connected');

    socket.on('join', (userId: string) => {
      socket.join(userId);
    });

    socket.on('sendMessage', async (data: { senderId: string, recipientId: string, content: string, mediaUrl?: string, mediaType?: string }) => {
      const { senderId, recipientId, content, mediaUrl, mediaType } = data;

      // Encrypt the message
      const encryptedMessage = encrypt(content);

      // Save the message to MongoDB
      const message = new Message({
        senderId,
        recipientId,
        content: encryptedMessage.encryptedData,
        iv: encryptedMessage.iv,
        mediaUrl,
        mediaType
      });

      await message.save();

      // Send the encrypted message to the recipient
      io.to(recipientId).emit('newMessage', {
        senderId,
        content: encryptedMessage.encryptedData,
        iv: encryptedMessage.iv,
        mediaUrl,
        mediaType
      });
    });

    socket.on('initializeCall', (data: { callerId: string, recipientId: string, callType: 'audio' | 'video' }) => {
      io.to(data.recipientId).emit('incomingCall', { callerId: data.callerId, callType: data.callType });
    });

    socket.on('acceptCall', (data: { callerId: string, recipientId: string }) => {
      io.to(data.callerId).emit('callAccepted', { recipientId: data.recipientId });
    });

    socket.on('rejectCall', (data: { callerId: string, recipientId: string }) => {
      io.to(data.callerId).emit('callRejected', { recipientId: data.recipientId });
    });

    socket.on('iceCandidate', (data: { candidate: RTCIceCandidate, recipientId: string }) => {
      io.to(data.recipientId).emit('iceCandidate', { candidate: data.candidate });
    });

    socket.on('offer', (data: { offer: RTCSessionDescriptionInit, recipientId: string }) => {
      io.to(data.recipientId).emit('offer', { offer: data.offer });
    });

    socket.on('answer', (data: { answer: RTCSessionDescriptionInit, recipientId: string }) => {
      io.to(data.recipientId).emit('answer', { answer: data.answer });
    });

    socket.on('endCall', (data: { recipientId: string }) => {
      io.to(data.recipientId).emit('callEnded');
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};

