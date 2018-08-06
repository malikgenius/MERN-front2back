const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "post"
  },
  postId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Comment = mongoose.model("comment", CommentSchema);
