"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var cors_1 = __importDefault(require("cors"));
var dotenv_1 = __importDefault(require("dotenv"));
var mongoose_1 = __importDefault(require("mongoose"));
var auth_1 = __importDefault(require("./routes/auth"));
var posts_1 = __importDefault(require("./routes/posts"));
var chat_1 = __importDefault(require("./routes/chat"));
var notifications_1 = __importDefault(require("./routes/notifications"));
var admin_1 = __importDefault(require("./routes/admin"));
var socketio_1 = require("./socketio");
dotenv_1.default.config();
var app = (0, express_1.default)();
var httpServer = (0, http_1.createServer)(app);
var io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST']
    }
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Database connection
mongoose_1.default.connect(process.env.MONGODB_URI);
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/posts', posts_1.default);
app.use('/api/chat', chat_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/admin', admin_1.default);
// Socket.IO setup
(0, socketio_1.setupSocketIO)(io);
var PORT = process.env.PORT || 3000;
httpServer.listen(PORT, function () {
    console.log("Server running on port ".concat(PORT));
});
//# sourceMappingURL=index.js.map