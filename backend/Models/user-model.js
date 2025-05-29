const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    Username: String,
    HashedPassword: String,
    Email: String
})

const User = mongoose.model("User", userSchema, "users");

module.exports = User;