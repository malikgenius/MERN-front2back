const express = require("express");
const router = express.Router();
const passport = require("passport");
const mongoose = require("mongoose");
const Fawn = require("fawn");
const Comment = require("../../model/Comment");
const User = require("../../model/User");
const Post = require("../../model/Post");

Fawn.init(mongoose);
//Get All the Comments
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Comment.find()
      .sort({ date: -1 })
      .then(comments => {
        return res.json(comments);
      });
    // res.json("You have reached Comments");
  }
);

// Comments by User ...
router.get(
  "/byuser/:user_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Comment.find({ userId: req.params.user_id })
      .then(comment => {
        if (!comment) {
          return res.json("User has not yet commented");
        }
        return res.json(comment);
      })
      .catch(err => {
        res.json(err);
      });
  }
);

// Comments By Post, All comments related to a Post should be in order. ...
router.get(
  "/bypost/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Comment.find({ postId: req.params.post_id })
      // latest comment on top
      .sort({ date: -1 })
      .then(comment => {
        if (!comment) {
          return res.json("No comments found for this post");
        }
        return res.json(comment);
      })
      .catch(err => {
        res.json(err);
      });
  }
);

// Post a Comment
router.post(
  "/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let commentData = {
      userId: req.user.id,
      userName: req.user.name,
      postId: req.params.post_id,
      text: req.body.text
    };
    // return res.json(req.user);
    User.findOne({ _id: req.user.id })
      .populate("user", ["name", "email"])
      .then(user => {
        if (!user) {
          return res.status(404).json("User Not Found");
        }
        Post.findById(req.params.post_id).then(post => {
          if (!post) {
            return res.status(404).json("post not found");
          }
          // Fawn Transactions.
          // new Fawn.Task().save("comments", commentData).then(data => {
          //   post.comment
          //     .unshift(data.id)
          //     .save("posts", data.id)
          //     .run();
          //   res.json(data);
          // });
          // return res.json(post);
          try {
            new Comment(commentData).save().then(data => {
              // return res.json(data.id);
              const commentId = data.id;
              // return res.json(commentId);
              post.comment.unshift(data.id);
              post.save();
              return res.json(data);
            });
          } catch (err) {
            res.status(500).json("Internal Server Error, Please try in a bit");
          }
        });
      })
      .catch(err => {
        res.json(err);
      });
  }
);

// Edit Comment
router.post(
  "/edit/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const updatedComment = { date: Date() };
    if (req.body.text) {
      updatedComment.text = req.body.text;
    }

    Comment.findById(req.params.comment_id)
      .then(comment => {
        if (comment.userId !== req.user.id) {
          return res
            .status(404)
            .json("You are not allowed to edit this comment");
        }
        Comment.findByIdAndUpdate(
          { _id: req.params.comment_id },
          { $set: updatedComment },
          { new: true }
        ).then(comment => {
          res.json(comment);
        });
      })
      .catch(err => {
        res.status(404).json(err);
      });
  }
);

// Delete Comment
router.post(
  "/delete/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // return res.json(req.user);
    Comment.findById(req.params.comment_id).then(comment => {
      if (!comment) {
        res.status(404).json("Comment not found");
      }
      Post.findById(comment.postId).then(post => {
        if (!comment) {
          return res.json("Comment not Found");
        }
        // return res.json(post);
        // Post owner or Comment user can delete comments ..
        // we need to change post.user.toString() to make it equal to the id or it wont work.

        if (
          comment.userId === req.user.id ||
          post.user.toString() === req.user.id
        ) {
          Comment.findOneAndRemove(req.params.comment_id).then(comment => {
            res.json(`${comment.text}   is deleted successfully`);
          });
        } else res.json(" You are not allowed to delete this comment");
      });
    });
  }
);

module.exports = router;
