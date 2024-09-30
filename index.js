const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const ACTIONS = require("./Actions");
const authRoutes = require("./routes/authRoutes");
const snippetRoutes = require("./routes/snippetRoutes");
const cors = require("cors");
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(cors());

// Configure CORS
const corsOptions = {
  origin: "https://main--codesconnect.netlify.app", // Your frontend URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Enable set cookie on cross-origin requests
};

app.use(cors(corsOptions));
const userSocketMap = {};

// Utility function to get all connected clients in a room
const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
};

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes for authentication
app.use("/api/auth", authRoutes);
app.use("/api/snippets", snippetRoutes);

// Socket.io for real-time communication
io.on("connection", (socket) => {
  // Handle user joining a room
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });
  // Handle code changes and broadcast to the room for a specific file
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code, fileId }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code, fileId });
  });

  // Sync code with a specific socket
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Handle language changes and broadcast to the room
  socket.on(ACTIONS.LANGUAGE_CHANGE, ({ roomId, language, fileId }) => {
    socket.in(roomId).emit(ACTIONS.LANGUAGE_CHANGE, { language, fileId });
  });
  // Handle sending messages in the room
  socket.on(ACTIONS.SEND_MESSAGE, ({ roomId, message, username }) => {
    io.in(roomId).emit(ACTIONS.RECEIVE_MESSAGE, { message, username });
  });

  // Handle interview mode warnings
  socket.on(ACTIONS.INTERVIEW_WARNING, ({ roomId, message }) => {
    socket.in(roomId).emit(ACTIONS.INTERVIEW_WARNING, { message });
  });

  // Handle interview mode toggle
  socket.on(ACTIONS.TOGGLE_INTERVIEW_MODE, ({ roomId, enabled }) => {
    socket.in(roomId).emit(ACTIONS.INTERVIEW_MODE_UPDATED, { enabled });
  });

  // Handle file opening
  socket.on(ACTIONS.FILE_OPENED, ({ roomId, file }) => {
    socket.to(roomId).emit(ACTIONS.FILE_OPENED, file);
  });

  // Handle user disconnecting
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
    socket.leave();
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT})`));
