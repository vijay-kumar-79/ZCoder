// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const Message = require("./models/messageModel.js");
const connectDB = require("./config/db");
const aiRoute = require("./routes/AskAI.js");
require("dotenv").config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// routes
app.use("/api", aiRoute);
app.get("/ping", (req, res) => {
  console.log(process.env.GROQ_API_KEY);
  res.json({ msg: "API is working !!" });
});

// Room storage
let rooms = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join room
  socket.on("join-room", async ({ username, roomId }) => {
    currentUsername = username;
    currentRoomId = roomId;

    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Set(),
        sharedText: "",
      });
    }
    rooms.get(roomId).users.add(username);

    // Load previous messages from database
    try {
      const previousMessages = await Message.find({ roomId })
        .sort({ timestamp: 1 })
        .limit(100);

      socket.emit("room-init", {
        users: Array.from(rooms.get(roomId).users),
        sharedText: rooms.get(roomId).sharedText,
        previousMessages,
      });
    } catch (err) {
      console.error("Error loading messages:", err);
    }

    socket.to(roomId).emit("user-joined", username);
    io.to(roomId).emit("room-users", Array.from(rooms.get(roomId).users));
  });

  // Handle chat messages
  socket.on("send-msg", async ({ roomId, message, username }) => {
    try {
      // Save message to database
      const newMessage = new Message({ roomId, username, message });
      await newMessage.save();

      // Broadcast to all in room
      io.to(roomId).emit("recieve-msg", {
        username,
        message,
        timestamp: newMessage.timestamp,
      });
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Handle text edits (shared document)
  socket.on("text-edit", ({ roomId, text }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).sharedText = text;
    }
    socket.to(roomId).emit("text-edit", text);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    if (currentRoomId && currentUsername && rooms.has(currentRoomId)) {
      rooms.get(currentRoomId).users.delete(currentUsername);

      if (rooms.get(currentRoomId).users.size === 0) {
        rooms.delete(currentRoomId);
      } else {
        io.to(currentRoomId).emit("user-left", currentUsername);
        io.to(currentRoomId).emit(
          "room-users",
          Array.from(rooms.get(currentRoomId).users)
        );
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
