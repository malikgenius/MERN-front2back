// Google USERS MODEL FOR AUTHENTICATION

const mongoose = require("mongoose");
const { Schema } = mongoose;

var UserSchema = new mongoose.Schema({
  userName: String,
  userId: String,
  userEmail: String,
  userPhoto: String,
  updated_at: { type: Date, default: Date.now }
});

// UserSchema.statics.findOrCreate = require("find-or-create");
// const userSchema = new Schema({
//   googleId: String,
//   facebookID: String,
//   userEmail: String,
//   userName: String
// });
// Model Collection

const User = mongoose.model("users", UserSchema);

// Export User Model

module.exports = User;
