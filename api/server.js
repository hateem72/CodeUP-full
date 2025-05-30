import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import { fileURLToPath } from "url";
import path from "path";
import submissionRoutes from './routes/submission.js';
import vivaRoutes from "./routes/viva.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import roadmapRoutes from "./routes/roadmap.js";
import workspaceRoutes from "./routes/workspace.js";
import fileRoutes from "./routes/file.js";
import chatRoutes from "./routes/chat.js";
import executeRoutes from "./routes/execute.js";
import testWorkshopRoutes from "./routes/testWorkshop.js";
import teacherRoutes from "./routes/teacher.js";
import { Server } from "socket.io";
import { createServer } from "http";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use(session({
  secret: process.env.SESSION_SECRET || "your_session_secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`User ${socket.id} (${username}) joined room ${roomId}`);
    socket.to(roomId).emit("user-joined", { userId: socket.id, username });
  });

  socket.on("leave-room", ({ roomId }) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
    socket.to(roomId).emit("user-left", { userId: socket.id });
  });

  socket.on("code-update", ({ roomId, code, userId }) => {
    socket.to(roomId).emit("code-update", { code, userId });
  });

  socket.on("cursor-update", ({ roomId, cursor, username }) => {
    socket.to(roomId).emit("cursor-update", { userId: socket.id, cursor, username });
  });

  socket.on("file-created", ({ roomId, file }) => {
    socket.to(roomId).emit("file-created", { file });
  });

  socket.on("file-deleted", ({ roomId, fileId }) => {
    socket.to(roomId).emit("file-deleted", { fileId });
  });

  socket.on("file-selected", ({ roomId, fileId }) => {
    socket.to(roomId).emit("file-selected", { fileId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    io.emit("user-left", { userId: socket.id });
  });
});


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/file", fileRoutes);
app.use("/api/student", submissionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/test-workshop", testWorkshopRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/viva", vivaRoutes);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));