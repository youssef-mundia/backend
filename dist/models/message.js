"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var messageSchema = new mongoose_1.default.Schema({
    senderId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ['text', 'image', 'audio', 'video'] },
    iv: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
exports.Message = mongoose_1.default.model('Message', messageSchema);
//# sourceMappingURL=message.js.map