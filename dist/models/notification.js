"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var notificationSchema = new mongoose_1.default.Schema({
    recipient: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['like', 'comment', 'reply', 'message'] },
    content: { type: String, required: true },
    relatedPost: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Post' },
    relatedComment: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Comment' },
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
exports.Notification = mongoose_1.default.model('Notification', notificationSchema);
//# sourceMappingURL=notification.js.map