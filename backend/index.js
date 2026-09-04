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
const profileRoute = require("./routes/Profile.js");
const socketHandler = require("./socketHandler");
const bookmarksRoute = require("./routes/Bookmarks.js");
const judgeRoute = require("./routes/Judge.js");
const problemsRoute = require("./routes/Problems.js");
const User = require("./models/UserModel.js");
const { JWT_SECRET } = require("./config/jwt");
require("dotenv").config();

if (!JWT_SECRET) {
  console.error("JWT_SECRET is not set. Set it in backend/.env before starting in production.");
  process.exit(1);
}

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
// 1mb keeps room for judge submissions whose code+stdin can approach 128 KB
// (express's default 100 KB limit would reject them before the proxy sees them).
app.use(express.json({ limit: "1mb" }));

// routes
app.use("/api", aiRoute);
app.use("/", loginRoute);
app.use("/api/solutions", solutionsRoute);
app.use("/user", profileRoute);
app.use("/bookmarks", bookmarksRoute);
app.use("/api/judge", judgeRoute);
app.use("/api/problems", problemsRoute);
app.get("/users/:username", async (req, res) => {
  const { username } = req.params;
  if (!username || username.trim() === "") {
    return res.status(400).send([]);
  }
  try {
    const usersList = await User.find({
      Username: { $regex: `^${username}`, $options: "i" },
    }).select("_id Username"); // Only select _id and Username fields

    if (usersList && usersList.length > 0) {
      // Map to return array of objects with id and username
      const result = usersList.map((user) => ({
        id: user._id,
        username: user.Username,
      }));
      res.status(200).send(result);
    } else {
      res.status(404).send("No users found!");
    }
  } catch (err) {
    res.status(500).send("Server error");
  }
});
app.get("/ping", (req, res) => {
  res.json({ msg: "API is working !!" });
});

socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
