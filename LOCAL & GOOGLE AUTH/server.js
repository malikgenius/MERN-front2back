const express = require("express");
const app = express();
const passport = require("passport");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const fs = require("fs");
// const expressSession = require("express-session");
// const cookieParser = require("cookie-parser");
const Keys = require("./config/Keys");
// if we load Schema on main page, it will prevent errors of duplicate schema for google and local.
// require("./models/USER");

// Passport Config
require("./passport/passport");
require("./passport/passportGoogle");
// Passport MiddleWare
app.use(passport.initialize());

// Routes to pages
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

// MONGODB CONNECTION
require("./mongodb/mongoose");

app.get("/", (req, res) => {
  res.send("Root Page for MERN APP!");
});

// MiddleWares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// morgan combined will log combined, apache and other formats.
app.use(morgan("combined"));
app.use(
  morgan("common", {
    stream: fs.createWriteStream("./access.log", { flags: "a" })
  })
);

// Routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, err => {
  if (err) {
    return console.log(err);
  }
  console.log(`listning on ${port}`);
});
