const mongoose = require("mongoose");
// mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

// Create Schema

const UserSchema = new Schema({
  // local: {
  name: {
    type: String
    // required: true
  },
  email: {
    type: String
    // required: true
  },
  password: {
    type: String
    // required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  // },
  // google: {
  userName: String,
  userId: String,
  userEmail: String,
  userPhoto: String,
  accessToken: String,
  updated_at: { type: Date, default: Date.now }
  // }
});

// Model Collection

const User = mongoose.model("users", UserSchema);

// Export User Model

module.exports = User;
