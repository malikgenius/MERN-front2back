const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const mongoose = require("mongoose");
const User = require("../models/USER");
const Keys = require("../config/Keys");

const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = Keys.secretOrKey;

// Passort Strategy for jwt logins

passport.use(
  new JwtStrategy(options, (jwt_payload, done) => {
    console.log(jwt_payload);
    User.findById(jwt_payload.id)
      .then(user => {
        if (user) {
          return (
            done(null, user),
            console.log({ name: user.name, email: user.email, id: user.id })
          );
        }
        return done(null, false);
      })
      .catch(err => {
        return err;
      });
  })
);

// Teacher Way in Front2back full stack dev.
// module.exports = passport => {
// passport.use(
//   new JwtStrategy(options, (jwt_payload, done) => {
//     User.findById(jwt_payload.id, (err, user) => {
//       if (err) {
//         return console.log(err);
//       } else if (user) {
//         console.log({ name: user.name, email: user.email });
//         return done(null, user);
//       }
//     });
//   })
// );
// };
