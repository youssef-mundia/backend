"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = exports.Post = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var commentSchema = new mongoose_1.default.Schema({
    author: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    replies: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Comment' }]
});
var postSchema = new mongoose_1.default.Schema({
    author: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ['image', 'video', 'audio', 'document'] },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    hashtags: [{ type: String }],
    reported: { type: Boolean, default: false }
});
exports.Post = mongoose_1.default.model('Post', postSchema);
exports.Comment = mongoose_1.default.model('Comment', commentSchema);
//# sourceMappingURL=post.js.map