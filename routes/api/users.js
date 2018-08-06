const express = require("express");
const User = require("../../model/User");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const jwt = require("jsonwebtoken");
const Joi = require("joi");
//Gridfs storage and crypto for files upload to mongodb.
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
// const conn = require("../../auth/mongodb/mongodb");
const mongoAuth = require("../../config/Keys").mongoAuth;
const GridFsStorage = require("multer-gridfs-storage");
// const GridFSBucket = require("multer-gridfs-bucket");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const secretOrKey = require("../../config/Keys").secretOrKey;

// create storage object
const storage = new GridFsStorage({
  url: mongoAuth,
  useNewUrlParser: true,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        // Date + original Name will be the name of file in db.
        const filename = Date.now() + file.originalname;
        // buf.toString("hex") + path.extname(avatar.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

// Register Route
router.post("/register", upload.single("file"), (req, res) => {
  const { name, email, password } = req.body;
  // return res.json(req.file.id);
  const avatarId = req.file.id;
  // return res.json(avatar);
  // Validation joi the validator
  const schema = {
    name: Joi.string()
      .regex(/^[a-zA-Z-0-9]{3,30}$/)
      .min(3)
      .max(30)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .regex(/^[a-zA-Z-0-9]{6,30}$/)
      .required(),
    avatarId: Joi.string()
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
      password,
      avatarId
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
              id: user.id,
              avatarId: user.avatar
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
      email: req.user.email,
      avatarId: req.user.avatarId
    });
  }
);

// gridfs Stream to read all the files saved in mongodb ..
// we have to open to connection to gridfs once to get the files ..
const conn = mongoose.createConnection(mongoAuth);
let gfs;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Get All files in Gridfs mongodb uploads.files collection
router.get(
  "/files",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // return res.json(req.user);
    gfs.files.find().toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files found"
        });
      }
      return res.json(files);
    });
  }
);

// Get User Profile Picture from Gridfs
// readStream for browser to display the image.

router.get(
  "/files/avatar",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // we hvae to convert avatarId into ObjectId to match it with _id of gfs stream file.
    let ObjectId = require("mongoose").Types.ObjectId;
    gfs.files.findOne({ _id: new ObjectId(req.user.avatarId) }, (err, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: "no files found"
        });
      }

      // Displaying Image to browser ............... :)
      if (file.contentType === "image/jpeg" || file.contentType === "img/png") {
        const readStream = gfs.createReadStream(file.filename);
        readStream.pipe(res);
        // res.json({
        //   id: req.user.id,
        //   name: req.user.name,
        //   email: req.user.email
        // });
        // readStream.pipe(res);
      } else {
        res.status(404).json({
          err: "not an image"
        });
      }
      // return res.json(file);
    });
  }
);

// Get File from Params .....
router.get(
  "/files/:file",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // console.log(req.user.avatar);
    gfs.files.findOne({ filename: req.params.file }, (err, file) => {
      if (!file) {
        return res.status(404).json("file Not found");
      }
      return res.json(file);
    });
  }
);

module.exports = router;
