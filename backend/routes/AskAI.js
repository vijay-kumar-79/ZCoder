const Groq = require("groq-sdk");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
require('dotenv').config();

// Initialize Groq with your API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Simple in-memory rate limiter (per user). Fine for a single instance;
// swap for a shared store (Redis) if the app is ever horizontally scaled.
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;
const hits = new Map();

function rateLimit(req, res, next) {
  const key = req.user.user_id;
  const now = Date.now();
  const entry = hits.get(key);

  // Opportunistically prune stale entries so the map never grows unbounded
  if (hits.size > 5000) {
    for (const [k, e] of hits) {
      if (now - e.resetAt > WINDOW_MS) hits.delete(k);
    }
  }

  if (!entry || now - entry.resetAt > WINDOW_MS) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: "Too many requests. Please try again in a minute." });
  }
  next();
}

async function getGroqChatCompletion(message) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}

router.post("/ask-ai", auth, rateLimit, async (req, res) => {
  try {
    const { message } = req.body;

    if (typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (message.length > 4000) {
      return res.status(400).json({ error: "Message is too long (max 4000 characters)" });
    }

    const chatCompletion = await getGroqChatCompletion(message);
    let ans = chatCompletion.choices[0]?.message?.content || "";
    res.json({
      answer: ans,
    });
  } catch (error) {
    console.error("AI API error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

module.exports = router;