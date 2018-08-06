const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
// mongoose.Promise = require("bluebird");
const passport = require("passport");
const Post = require("../../model/Post");
const Profile = require("../../model/Profile");
const User = require("../../model/User");
const postValidation = require("./postvalidation-joi");

// Get Current Posts
// @Private Route
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.find()
      // Populate user or users if many and comments check the Post Schema.Types.ObjectId
      .populate("user")
      // Populate comments check the Post Schema.Types.ObjectId - check Post Model for ref
      .populate("comment")
      .sort({ date: -1 })
      .then(post => {
        return res.json(post);
      })
      .catch(err => res.json(err));
  }
);

// I CANT DO mongodb Promises to get the comments from post ... exec and populate need to be learned the hard way.
// Get Current Post to get its All Comments along with it.
// @Private Route
router.get(
  "/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById({ _id: req.params.post_id })
      // Populate user or users if many and comments check the Post Schema.Types.ObjectId
      .populate("user")
      // Populate comments check the Post Schema.Types.ObjectId - check Post Model for ref
      .populate("comment")
      .then(post => {
        res.json(post);
      })
      .catch(err => {
        res.status(400).json(err);
      });
  }
);

// Get Current Post and specific comment to get populate option working... TESTING ONLY
// @Private Route
router.get(
  "/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.find()
      .populate("comment")
      .then(function(err, params) {
        return console.log(params);
      });

    // .populate("comment", ["comment", "userName"])
  }
);

// .populate({
//   path: "comment",
//   populate: {
//     postId: "postId",
//     userId: "userId",
//     userName: "userName",
//     comemnt: "comment",
//     date: "date"
//   }
// })

// POST NEW Post
// @Private Route

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    postValidation(req.body, res);
    const newPost = {
      title: req.body.title,
      text: req.body.text,
      name: req.user.name,
      avatar: req.user.avatar,
      user: req.user.id
      // comments: []
    };
    // Extra security by checking if the user is legitimate, dont know if this works :)
    User.findById(req.user.id).then(user => {
      if (!user) {
        return res.status(404).json({ Err: "Cant find a User with given Id" });
      }
      // return res.json(req.user);
      // We can go this way as well ..
      //   newPost.save().then(post => res.json(post));
      new Post(newPost).save().then(post => {
        res.json(post);
      });
    });
  }
);
// //@ update Current Post
// // Private POST Request

router.post(
  "/postupdate/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Updates
    const postFields = { date: Date() };
    if (req.body.text) {
      postFields.text = req.body.text;
    }
    User.findOne({ _id: req.user.id }).then(profile => {
      //   return res.json(profile);
      Post.findById(req.params.id)
        .then(post => {
          //compare user id in post with user.id in req if they are same .. toString to convert userID in post into string.
          //javascript string makes object without property ... we can easily compare 2 values by changing them into string.
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json("Not Authenticated to Modify Post");
          }
          // now findByIdAndUpdate the post as we know, the user is verified and the same user who posted ..
          Post.findByIdAndUpdate(
            { _id: req.params.id },
            { $set: postFields },
            { new: true }
          ).then(post => {
            res.json(post);
          });
        })
        .catch(err => {
          res.json("Post not found");
        });
    });
  }
);
//@ Delete Selected Post
// Private Route
router.delete(
  "/delete/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // first find user to check if the user is same who has posted this post
    User.findOne({ _id: req.user.id }).then(profile => {
      // now find the post by id to check if the post is available
      Post.findById(req.params.id).then(post => {
        // res.json(post);
        // now check if the user in post is === to the logged in user
        //javascript string makes object without property ... we can easily compare 2 values by changing them into string.
        if (post.user.toString() !== req.user.id) {
          return res.json("Not Authenticated!");
        }
        // we are sure that logged in user and user in post is same, we can just go and delete the post.
        // we can again findByIdAndRemove but the best way is to post.remove as it ensures we are deleting the same post which was returned.

        // Post.findByIdAndRemove(req.params.id)
        //   .then(() => {
        //     res.json("Post Deleted");
        //   })

        // post.remove is the easiest way and straight forward without going back again to findbyidandremove.. both work well.
        post
          .remove()
          .then(() => {
            res.json("Post Removed");
          })
          .catch(err => {
            res.json(err);
          });
      });
    });
  }
);

// //@ LIKES to POST
// // Private POST Request

router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // we can fetch user from Profile or User, its upto us
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id).then(post => {
          //javascript string makes object without property ... we can easily compare 2 values by changing them into string.
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already liked this post" });
          }
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        });
      })
      .catch(err => {
        res.json(err);
      });
  }
);

// //@ UNLIKES to POST
// // Private POST Request
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id).then(post => {
          //javascript string makes object without property ... we can easily compare 2 values by changing them into string.
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "You have not yet liked this post" });
          }
          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);
          // Splice out of Array
          post.likes.splice(removeIndex, 1);
          // save it to DB
          post.save().then(post => res.json(post));
        });
      })
      .catch(err => {
        res.send(400).json(err);
      });
  }
);

// //@ Comments to POST
// // Private POST Request
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newComment = {
      comment: req.body.comment,
      name: req.user.name,
      userID: req.user.id,
      avatar: req.user.avatar
    };
    // res.json(req.user);
    // find User to get its name, email, avatar etc. profile doesnt have name for me, i could add names in profile.
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // return res.json(profile);
        Post.findById(req.params.id).then(post => {
          post.comments.unshift(newComment);
          post.save().then(post => {
            res.json(post);
          });
        });
      })
      .catch(err => {
        res.json(err);
      });
  }
);

// //@ Comments DELETE  Router delete
// // Private POST Request
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findOne({ _id: req.user.id })
      .then(profile => {
        // profile can be used later down, to get the userID, name etc.
        Post.findById(req.params.id).then(post => {
          // res.json(post);
          // lets filter the comments from post to find one matching our params comment_id
          if (
            post.comments.filter(
              //javascript string makes object without property ... we can easily compare 2 values by changing them into string.
              comment => comment._id.toString() === req.params.comment_id
            ).length === 0
          ) {
            return res
              .status(404)
              .json({ commentnotexists: "comment does not exist" });
          } else if (
            // Got the exact comment_id now lets verify if the user saved in comment is same as in profile who wants to delete the comment. ?
            post.comments.filter(
              // we can check it with User id from profile or can be checked from req.user.id but from profile we can match other values as well
              // like name etc ....
              //javascript string makes object without property ... we can easily compare 2 values by changing them into string.

              comment => comment.userID.toString() === profile.id
            ).length === 0
          ) {
            return res.status(401).json({
              unauthorized: "You are not Authorized to delete this comment"
            });
          }
          // lets Index it out with map command.
          const removeIndex = post.comments
            .map(item => item.id.toString())
            .indexOf(req.params.comment_id);
          // Splice comment out of array
          post.comments.splice(removeIndex, 1);
          post.save().then(post => res.json(post));
        });
      })
      .catch(err => {
        res.status(400).json(err);
      });
  }
);

// //@ Comments UPDATE/ EDIT to POST - basically we will remove comment from array and record its place in array and add the new comment on same place.
// dont know how to update something array but will delete first and replace it with new one on same place .
// // Private POST Request
router.post(
  //postid/:comment_id
  "/commentupdate/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // return res.json(req.user);
        Post.findById(req.params.id).then(post => {
          // console.log(req.user.id, profile.id);
          if (
            post.comments.filter(
              //javascript string makes object without property ... we can easily compare 2 values by changing them into string.
              comment => comment._id.toString() === req.params.comment_id
            ).length === 0
          ) {
            return res.json("Comment not found");
          } else if (
            post.comments.filter(
              comment => comment.userID.toString() === profile.user.toString()
            ).length === 0
          ) {
            return res.status(401).json({
              unauthorized: ` ${
                req.user.name
              } you are not authorized to edit this comment`
            });
          }
          // First remove old comment - as there is no other way for embaded comment in post
          const removeIndex = post.comments
            .map(comment => comment.id.toString())
            .indexOf(req.params.comment_id);
          // res.json(removeIndex);
          // splice(removeIndex, 1) = will remove specific index in array and 1 means only remove one.
          post.comments.splice(removeIndex, 1);
          // now get the new comment and add the same id as old one to it.
          let newData = {
            comment: req.body.comment + " " + "edited",
            _id: req.params.comment_id,
            name: req.user.name,
            userID: req.user.id,
            avatar: req.user.avatar
          };
          // console.log(removeIndex);
          // bring it up to the list as its edited should be on top -- unshift will bring the comment into TOP
          // post.comments.unshift(newData);

          // splice(indexNumber, 0, newData) will place edited comment (originally new comment on same place as old comment)
          // removeIdex = same index number of old comment.
          // 0 = dont remove anything from splice method
          // newData = but add new data to the array
          post.comments.splice(removeIndex, 0, newData);
          post.save().then(post => {
            return res.json(post);
          });
        });
      })
      .catch(err => {
        res.send(err);
      });
  }
);

module.exports = router;
