const passport = require("passport");
const mongoose = require("mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const Keys = require("../config/Keys");
const User = require("../models/USER");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

// Google+ API
passport.use(
  new GoogleStrategy(
    {
      clientID: Keys.googleClientID,
      clientSecret: Keys.googleClientSecret,
      callbackURL: "/api/users/google/callback",
      // proxy will automatically redirect request to https when we run this app from heroku
      proxy: true
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile.emails[0].value);
      // console.log(profile);
      User.findOne({ userId: profile.id }).then(existingUser => {
        if (existingUser) {
          // const payload = {
          //   id: existingUser.userId,
          //   name: existingUser.userName,
          //   email: existingUser.userEmail
          // };
          // jwt.sign(payload, "SECRET", { expiresIn: 72000 }, (err, token) => {
          //   if (err) throw err;
          //   res.json({
          //     success: true,
          //     token: "Bearer " + token,
          //     name: user.name,
          //     email: user.email
          //   });
          //   console.log({
          //     id: existingUser.userId,
          //     name: existingUser.userName,
          //     email: existingUser.userEmail
          //     // token: "Bearer " + token
          //   });
          // });
          done(null, existingUser);

          // console.log(existingUser);
        } else {
          // Google profile picture comes in 50px we need to remove size after .jpg
          const userPhoto = profile.photos[0].value.substring(
            0,
            profile.photos[0].value.indexOf("?")
          );
          new User({
            userId: profile.id,
            accessToken: accessToken,
            userName: profile.displayName,
            userEmail: profile.emails[0].value,
            userPhoto
          })
            .save()
            // .then(user => done(null, user))
            .then(user => {
              const payload = {
                id: user.userId,
                name: user.userName,
                email: user.userEmail
              };
              // Sign Token with JWT
              // No promise with jwt.sign use callback
              // jwt.sign(
              //   payload,
              //   "SECRET",
              //   { expiresIn: 72000 },
              //   (err, token) => {
              //     if (err) throw err;
              //     res.json({
              //       success: true,
              //       token: "Bearer " + token,
              //       name: user.name,
              //       email: user.email
              //     });
              //     console.log({
              //       id: existingUser.userId,
              //       name: existingUser.userName,
              //       email: existingUser.userEmail
              //       // token: "Bearer " + token
              //     });
              //   }
              // );
              done(null, user);
              console.log({
                name: user.userName,
                email: user.userEmail,
                id: user.userId
                // token: token
              });
            })

            .catch(err => {
              console.log(err);
            });
        }
      });
    }
  )
);
