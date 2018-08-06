const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Create Schema
const PostSchema = Schema({
  // Connect this Schema with Users Collection.
  // below is for single user
  // user: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'users'
  // },
  // we shoudld have used sigle object for user but to try if we can have more than one users ..
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  // we have use below method to get all the comments from different users on single post from comment Model.
  // below is the correct method to get this done.. took me many days to figure it out.
  comment: [
    {
      type: Schema.Types.ObjectId,
      ref: "comment"
    }
  ],
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  // name: {
  //   type: String
  // },
  // avatar: {
  //   type: String
  // },
  // commentId: [
  //   {
  //     type: String
  //   }
  // ],

  date: {
    type: Date,
    default: Date.now
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      }
    }
  ]

  // comments: [
  //   {
  //     user: {
  //       type: Schema.Types.ObjectId,
  //       ref: "users"
  //     },
  //     comment: {
  //       type: String,
  //       required: true
  //     },
  //     userID: {
  //       type: String
  //     },
  //     name: {
  //       type: String
  //     },
  //     avatar: {
  //       type: String
  //     },
  //     date: {
  //       type: Date,
  //       default: Date.now
  //     }
  //   }
  // ]
});

module.exports = Post = mongoose.model("post", PostSchema);
