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
exports.setupSocketIO = void 0;
var message_1 = require("./models/message");
var crypto_1 = __importDefault(require("crypto"));
var algorithm = 'aes-256-cbc';
var key = crypto_1.default.randomBytes(32);
var iv = crypto_1.default.randomBytes(16);
function encrypt(text) {
    var cipher = crypto_1.default.createCipheriv(algorithm, Buffer.from(key), iv);
    var encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}
function decrypt(text) {
    var iv = Buffer.from(text.iv, 'hex');
    var encryptedText = Buffer.from(text.encryptedData, 'hex');
    var decipher = crypto_1.default.createDecipheriv(algorithm, Buffer.from(key), iv);
    var decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
var setupSocketIO = function (io) {
    io.on('connection', function (socket) {
        console.log('A user connected');
        socket.on('join', function (userId) {
            socket.join(userId);
        });
        socket.on('sendMessage', function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var senderId, recipientId, content, mediaUrl, mediaType, encryptedMessage, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        senderId = data.senderId, recipientId = data.recipientId, content = data.content, mediaUrl = data.mediaUrl, mediaType = data.mediaType;
                        encryptedMessage = encrypt(content);
                        message = new message_1.Message({
                            senderId: senderId,
                            recipientId: recipientId,
                            content: encryptedMessage.encryptedData,
                            iv: encryptedMessage.iv,
                            mediaUrl: mediaUrl,
                            mediaType: mediaType
                        });
                        return [4 /*yield*/, message.save()];
                    case 1:
                        _a.sent();
                        // Send the encrypted message to the recipient
                        io.to(recipientId).emit('newMessage', {
                            senderId: senderId,
                            content: encryptedMessage.encryptedData,
                            iv: encryptedMessage.iv,
                            mediaUrl: mediaUrl,
                            mediaType: mediaType
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        socket.on('initializeCall', function (data) {
            io.to(data.recipientId).emit('incomingCall', { callerId: data.callerId, callType: data.callType });
        });
        socket.on('acceptCall', function (data) {
            io.to(data.callerId).emit('callAccepted', { recipientId: data.recipientId });
        });
        socket.on('rejectCall', function (data) {
            io.to(data.callerId).emit('callRejected', { recipientId: data.recipientId });
        });
        socket.on('iceCandidate', function (data) {
            io.to(data.recipientId).emit('iceCandidate', { candidate: data.candidate });
        });
        socket.on('offer', function (data) {
            io.to(data.recipientId).emit('offer', { offer: data.offer });
        });
        socket.on('answer', function (data) {
            io.to(data.recipientId).emit('answer', { answer: data.answer });
        });
        socket.on('endCall', function (data) {
            io.to(data.recipientId).emit('callEnded');
        });
        socket.on('disconnect', function () {
            console.log('A user disconnected');
        });
    });
};
exports.setupSocketIO = setupSocketIO;
//# sourceMappingURL=socketio.js.map