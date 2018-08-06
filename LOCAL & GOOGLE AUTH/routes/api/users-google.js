const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/USER");
const Keys = require("../../config/Keys");
// Load Input Validation
const validateRegisterInput = require("../../validation/register");
// REGISTER USERS

// we will use Promise, where .then(response) and at the end we can use .catch(err) for any kind of error. with .exec() as mongoose doesnt
// like native Promise of es6 and in new version we can use es6 promise through work around.
router.post("/register", (req, res) => {
  // Validation
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  // will use Promise here... but with .exec() function because mongodb has its own promise which is not ES6 promise, its a work around to use
  // es6 promise in new mongodb version which is 4.x and above
  const promise = User.findOne({ email: req.body.email }).exec();
  promise.then(existingUser => {
    if (existingUser) {
      return res.status(400).json({ Email: "USER ALREADY EXIST" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });
      bcrypt.genSalt(10).then(salt => {
        bcrypt.hash(newUser.password, salt).then(hash => {
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              const payload = {
                id: user.id,
                name: user.name,
                email: user.email
              };
              // Sign Token with JWT
              // No promise with jwt.sign use callback
              jwt.sign(
                payload,
                Keys.secretOrKey,
                { expiresIn: 72000 },
                (err, token) => {
                  if (err) throw err;
                  res.json({
                    success: true,
                    token: "Bearer " + token,
                    name: user.name,
                    email: user.email
                  });
                }
              );
            })

            .catch(err => {
              console.log(err);
            });
        });
      });
    }
  });
});

// @Route   GET api/users/login
// @desc    Register user
// @access  Public
// Login Route

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // Find user by email
  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ Email: "User not Found" });
    }
    // compare the password through bcrypt
    bcrypt
      .compare(password, user.password)
      .then(isMatch => {
        if (isMatch) {
          const payload = { id: user.id, name: user.name, email: user.email };
          // Sign Token with JWT
          // No promise with jwt.sign use callback
          jwt.sign(
            payload,
            Keys.secretOrKey,
            { expiresIn: 72000 },
            (err, token) => {
              if (err) throw err;
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          return res.status(400).json({ password: "Password is not Correct" });
        }
      })
      .catch(err => {
        console.log(err);
      });
  });
});

// Route GET /auth/google
// Google Login
router.get(
  "/google",
  passport.authenticate(
    "google",
    { scope: ["profile", "email"] }
    // { session: false }
  ),
  (req, res) => {
    res.json({
      res: res
    });
  }
);

// Route GET /google/callback
// Google success login
router.get(
  "/google/callback",
  passport.authenticate("google"),
  // passport.authenticate("google", { session: false }),
  (req, res) => {
    console.log(res.user);
    res.redirect("/dashboard");
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

// @Route   GET api/users/current
// @access  Private

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user);
    console.log(req.headers.authorization);
  }
);

// Current User

router.get("/verify", (req, res) => {
  if (req.user) {
    console.log(req.user, req.session);
    res.send({ user: "Got User" });
  } else {
    console.log("Not Auth");
  }
});

module.exports = router;
