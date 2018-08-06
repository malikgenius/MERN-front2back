const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const secretOrKey = require("../../config/Keys").secretOrKey;

const User = mongoose.model("users");

const options = {};

options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = secretOrKey;

passport.use(
  new JwtStrategy(options, (jwt_payload, done) => {
    // console.log(jwt_payload); // jwt_payload (token) has id, user.name, user.email, issue at, expiresIn
    // find user and return user to frontend
    User.findById(jwt_payload.id)
      .then(user => {
        if (user) {
          return done(null, user);
        }
        // if no user return false and null for no errors.
        return done(null, false);
      })
      .catch(err => {
        console.log(err);
      });
  })
);
