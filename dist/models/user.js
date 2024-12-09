"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var userSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    university: { type: String, required: true },
    name: { type: String, required: true },
    bio: { type: String },
    profilePicture: { type: String },
    friends: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=user.js.map