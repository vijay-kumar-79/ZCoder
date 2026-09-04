const mongoose = require("mongoose");

const SolutionSchema = new mongoose.Schema({
  problemSlug: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  votes: {
    type: Number,
    default: 0,
  },
  // Tracks who voted how, so each user can vote exactly once
  voters: {
    type: [
      {
        userId: { type: String, required: true },
        voteType: { type: String, enum: ["upvote", "downvote"], required: true },
      },
    ],
    default: [],
    _id: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Solution", SolutionSchema);
