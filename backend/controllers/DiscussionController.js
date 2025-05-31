// controllers/discussionController.js
const Discussion = require("../models/DiscussionModel");

// Get all solutions for a problem
exports.getSolutions = async (req, res) => {
  try {
    const solutions = await Discussion.findOne({
      questionId: req.params.id,
    }).populate("posts.userId", "username");

    if (!solutions) {
      return res
        .status(404)
        .json({ message: "No solutions found for this problem" });
    }

    res.json(solutions.posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a solution to a problem
exports.addSolution = async (req, res) => {
  try {
    let discussion = await Discussion.findOne({ problemId: req.params.id });

    if (!discussion) {
      discussion = new Discussion({
        problemId: req.params.id,
        posts: [],
      });
    }

    discussion.posts.push({
      userId: req.user._id,
      content: req.body.content,
    });

    await discussion.save();
    res.status(201).json(discussion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
