const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const auth = require("../middleware/auth");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/jwt");

router.post("/register/", async (request, response) => {
  try {
    const { username, password, email } = request.body;

    if (!username || !email || !password) {
      return response.status(400).send("All fields are required");
    }
    if (password.length < 6) {
      return response.status(400).send("Password is too short");
    }

    // Check uniqueness before doing the expensive hash
    const dbUsername = await User.findOne({ Username: username });
    if (dbUsername) {
      return response.status(400).send("Username already exists");
    }
    const dbEmail = await User.findOne({ Email: email });
    if (dbEmail) {
      return response.status(400).send("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      Username: username,
      HashedPassword: hashedPassword,
      Email: email,
    });
    await User.create(newUser);
    response.status(200).send("User created successfully");
  } catch (err) {
    console.error("Registration error:", err);
    response.status(500).send("Server error");
  }
});

router.post("/login/", async (req, res) => {
  try {
    const { username, password } = req.body;
    const dbuser = await User.findOne({ Username: username });

    if (!dbuser) {
      return res.status(400).json({ error: "Invalid user" });
    }

    const checkPw = await bcrypt.compare(password, dbuser.HashedPassword);
    if (checkPw) {
      const payload = {
        username: username,
        user_id: dbuser._id.toString(),
      };
      const jwtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return res.json({ token: jwtoken });
    } else {
      return res.status(400).json({ error: "Invalid password" });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select('-HashedPassword');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;