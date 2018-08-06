const mongoose = require("mongoose");

const Schema = mongoose.Schema;
// Schema
const UserSchema = Schema({
  // posts associated with user, we get post Schema associated with user, so each user will have full record
  //of all the posts he/she made.
  post: [
    {
      type: Schema.Types.ObjectId,
      ref: "post"
    }
  ],
  comment: [
    {
      type: Schema.Types.ObjectId,
      ref: "comment"
    }
  ],
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  avatarId: {
    type: String
  },
  commentId: [
    {
      type: String
    }
  ],
  postId: [
    {
      type: String
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("users", UserSchema);

module.exports = User;
