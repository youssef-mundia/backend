"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var auth_1 = require("../middleware/auth");
var fileUpload_1 = require("../middleware/fileUpload");
var post_1 = require("../models/post");
var notification_1 = require("../models/notification");
var router = express_1.default.Router();
router.get('/', auth_1.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var posts, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, post_1.Post.find({ author: { $in: req.user.university } })
                        .populate('author', 'email')
                        .populate('likes', 'email')
                        .populate({
                        path: 'comments',
                        populate: [
                            { path: 'author', select: 'email' },
                            { path: 'likes', select: 'email' },
                            {
                                path: 'replies',
                                populate: [
                                    { path: 'author', select: 'email' },
                                    { path: 'likes', select: 'email' }
                                ]
                            }
                        ]
                    })
                        .sort('-createdAt')];
            case 1:
                posts = _a.sent();
                res.json(posts);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                res.status(500).json({ message: 'Error fetching posts' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.post('/', auth_1.authenticateToken, fileUpload_1.upload.single('media'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var content, media, hashtags, post, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                content = req.body.content;
                media = req.file;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                hashtags = content.match(/#[a-zA-Z0-9]+/g) || [];
                post = new post_1.Post({
                    content: content,
                    author: req.user._id,
                    mediaUrl: media ? media.filename : undefined,
                    mediaType: media ? media.mimetype.split('/')[0] : undefined,
                    hashtags: hashtags.map(function (tag) { return tag.slice(1); })
                });
                return [4 /*yield*/, post.save()];
            case 2:
                _a.sent();
                res.status(201).json(post);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                res.status(500).json({ message: 'Error creating post' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post('/:postId/like', auth_1.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var post, notification, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, post_1.Post.findById(req.params.postId)];
            case 1:
                post = _a.sent();
                if (!post) {
                    return [2 /*return*/, res.status(404).json({ message: 'Post not found' })];
                }
                if (!post.likes.includes(req.user._id)) return [3 /*break*/, 2];
                post.likes = post.likes.filter(function (id) { return !id.equals(req.user._id); });
                return [3 /*break*/, 4];
            case 2:
                post.likes.push(req.user._id);
                if (!!post.author.equals(req.user._id)) return [3 /*break*/, 4];
                notification = new notification_1.Notification({
                    recipient: post.author,
                    type: 'like',
                    content: "".concat(req.user.email, " liked your post"),
                    relatedPost: post._id,
                    sender: req.user._id
                });
                return [4 /*yield*/, notification.save()];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [4 /*yield*/, post.save()];
            case 5:
                _a.sent();
                res.json(post);
                return [3 /*break*/, 7];
            case 6:
                error_3 = _a.sent();
                res.status(500).json({ message: 'Error liking post' });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
router.post('/:postId/comment', auth_1.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var content, post, comment, notification, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                content = req.body.content;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, post_1.Post.findById(req.params.postId)];
            case 2:
                post = _a.sent();
                if (!post) {
                    return [2 /*return*/, res.status(404).json({ message: 'Post not found' })];
                }
                comment = new post_1.Comment({
                    content: content,
                    author: req.user._id
                });
                post.comments.push(comment);
                return [4 /*yield*/, post.save()];
            case 3:
                _a.sent();
                if (!!post.author.equals(req.user._id)) return [3 /*break*/, 5];
                notification = new notification_1.Notification({
                    recipient: post.author,
                    type: 'comment',
                    content: "".concat(req.user.email, " commented on your post"),
                    relatedPost: post._id,
                    sender: req.user._id
                });
                return [4 /*yield*/, notification.save()];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                res.status(201).json(comment);
                return [3 /*break*/, 7];
            case 6:
                error_4 = _a.sent();
                res.status(500).json({ message: 'Error creating comment' });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
router.post('/:postId/comment/:commentId/reply', auth_1.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var content, post, parentComment, reply, notification, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                content = req.body.content;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, post_1.Post.findById(req.params.postId)];
            case 2:
                post = _a.sent();
                if (!post) {
                    return [2 /*return*/, res.status(404).json({ message: 'Post not found' })];
                }
                parentComment = post.comments.id(req.params.commentId);
                if (!parentComment) {
                    return [2 /*return*/, res.status(404).json({ message: 'Comment not found' })];
                }
                reply = new post_1.Comment({
                    content: content,
                    author: req.user._id
                });
                parentComment.replies.push(reply);
                return [4 /*yield*/, post.save()];
            case 3:
                _a.sent();
                if (!!parentComment.author.equals(req.user._id)) return [3 /*break*/, 5];
                notification = new notification_1.Notification({
                    recipient: parentComment.author,
                    type: 'reply',
                    content: "".concat(req.user.email, " replied to your comment"),
                    relatedPost: post._id,
                    sender: req.user._id
                });
                return [4 /*yield*/, notification.save()];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                res.status(201).json(reply);
                return [3 /*break*/, 7];
            case 6:
                error_5 = _a.sent();
                res.status(500).json({ message: 'Error creating reply' });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
router.post('/:postId/comment/:commentId/like', auth_1.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var post, comment, notification, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, post_1.Post.findById(req.params.postId)];
            case 1:
                post = _a.sent();
                if (!post) {
                    return [2 /*return*/, res.status(404).json({ message: 'Post not found' })];
                }
                comment = post.comments.id(req.params.commentId);
                if (!comment) {
                    return [2 /*return*/, res.status(404).json({ message: 'Comment not found' })];
                }
                if (!comment.likes.includes(req.user._id)) return [3 /*break*/, 2];
                comment.likes = comment.likes.filter(function (id) { return !id.equals(req.user._id); });
                return [3 /*break*/, 4];
            case 2:
                comment.likes.push(req.user._id);
                if (!!comment.author.equals(req.user._id)) return [3 /*break*/, 4];
                notification = new notification_1.Notification({
                    recipient: comment.author,
                    type: 'like',
                    content: "".concat(req.user.email, " liked your comment"),
                    relatedPost: post._id,
                    sender: req.user._id
                });
                return [4 /*yield*/, notification.save()];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [4 /*yield*/, post.save()];
            case 5:
                _a.sent();
                res.json(comment);
                return [3 /*break*/, 7];
            case 6:
                error_6 = _a.sent();
                res.status(500).json({ message: 'Error liking comment' });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
router.get('/trending', auth_1.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var trendingHashtags, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, post_1.Post.aggregate([
                        { $unwind: '$hashtags' },
                        { $group: { _id: '$hashtags', count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 10 }
                    ])];
            case 1:
                trendingHashtags = _a.sent();
                res.json(trendingHashtags);
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                res.status(500).json({ message: 'Error fetching trending topics' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.post('/:postId/report', auth_1.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var post, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, post_1.Post.findById(req.params.postId)];
            case 1:
                post = _a.sent();
                if (!post) {
                    return [2 /*return*/, res.status(404).json({ message: 'Post not found' })];
                }
                post.reported = true;
                return [4 /*yield*/, post.save()];
            case 2:
                _a.sent();
                res.json({ message: 'Post reported successfully' });
                return [3 /*break*/, 4];
            case 3:
                error_8 = _a.sent();
                res.status(500).json({ message: 'Error reporting post' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.get('/search', auth_1.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, posts, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                query = req.query.query;
                return [4 /*yield*/, post_1.Post.find({
                        $or: [
                            { content: { $regex: query, $options: 'i' } },
                            { hashtags: { $in: [new RegExp(query, 'i')] } }
                        ]
                    })
                        .populate('author', 'name email profilePicture')
                        .sort('-createdAt')];
            case 1:
                posts = _a.sent();
                res.json(posts);
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                res.status(500).json({ message: 'Error searching posts' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
//# sourceMappingURL=posts.js.map