const express = require("express");
const User = require("../../models/USER");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const jwt = require("jsonwebtoken");
const Joi = require("joi");
// const secretOrKey = require("../../../config/Keys").secretOrKey;
const secretOrKey = require("../../config/Keys").secretOrKey;

// Register Route
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  // Validation joi the validator
  const schema = {
    name: Joi.string()
      .regex(/^[a-zA-Z]{3,30}$/)
      .min(3)
      .max(30)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .regex(/^[a-zA-Z-0-9]{6,30}$/)
      .required()
  };
  const Validate = Joi.validate(req.body, schema);
  if (Validate.error) {
    // const message = Validate.error.details[0].message.substring(
    //   1,
    //   Validate.error.details[0].message.indexOf(":")
    // );
    console.log(Validate);
    return res.status(400).send(Validate.error.details[0].message);
  }

  User.findOne({ email }).then(user => {
    if (user) {
      return res.status(400).json({ Email: "User Already Registered" });
    }
    const newUser = new User({
      name,
      email,
      password
    });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then(user => {
            res.json({
              name: user.name,
              email: user.email,
              id: user.id
            });
          })
          .catch(err => {
            console.log(err);
          });
      });
    });
  });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  //Validation with Joi

  const schema = {
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .regex(/^[a-zA-Z-0-9]{6,30}$/)
      .required()
  };
  const Validate = Joi.validate(req.body, schema);
  if (Validate.error) {
    // substring to remove everything about the pattern after : it doesnt work with empty field :(
    // const message = Validate.error.details[0].message.substring(
    //   0,
    //   Validate.error.details[0].message.indexOf(":")
    // );
    console.log(Validate);
    return res.status(400).send(Validate.error.details[0].message);
  }

  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(400).json({ Error: "User not Found" });
    }
    bcrypt
      .compare(password, user.password)
      .then(isMatch => {
        if (isMatch) {
          // return res.json({ message: "success" });
          //Json web token
          const payload = { id: user.id, name: user.name, email: user.email };
          // we can go with return jwt.sign and wont need else
          jwt.sign(payload, secretOrKey, { expiresIn: "24h" }, (err, token) => {
            res.json({ token: "Bearer " + token });
          });
        } else {
          res.status(400).json({ password: "Wrong Password !" });
        }
      })
      .catch(err => {
        console.log(err);
      });
  });
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // first send msg: success for checking once everything is fine send user back which is in req
    // res.json({ msg: "success" });
    // user is in req as request has the token which holds everything about user.

    // dont send full user as it has hashed password.
    // res.json(req.user);
    // only send info we need to send back.
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
