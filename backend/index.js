// server.js
const express = require("express");
const http = require("http");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
const socketIo = require("socket.io");
const cors = require("cors");
// const Message = require("./models/messageModel.js");
const connectDB = require("./config/db");
const aiRoute = require("./routes/AskAI.js");
const loginRoute = require("./routes/LoginRoute.js");
const solutionsRoute = require("./routes/Solutions.js");
const socketHandler = require("./socketHandler");
require("dotenv").config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

app.use(
  cors({
    origin: "*",
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  next();
});
app.use(express.json());

// routes
app.use("/api", aiRoute);
app.use("/", loginRoute);
app.use("/api/solutions", solutionsRoute);
app.get("/ping", (req, res) => {
  console.log(process.env.GROQ_API_KEY);
  res.json({ msg: "API is working !!" });
});

socketHandler(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
