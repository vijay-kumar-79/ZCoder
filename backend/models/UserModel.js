const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  Username: String,
  HashedPassword: String,
  codeforcesHandle: String,
  codeforcesRating: String,
  email: String,
  name: String,
  phoneNumber: String,
  profilePicture: String,
  programmingLanguages: Object,
  skills: Object,
});

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
