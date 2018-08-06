const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const passport = require("passport");
const fs = require("fs");
require("./auth/mongodb/mongodb");

//Routes
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const notification = require("./routes/api/notification");
const posts = require("./routes/api/posts");
const comments = require("./routes/api/comments");

// MiddleWare
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("combined"));
app.use(passport.initialize());

// passport config
require("./auth/passport/passport");

// Grid init

app.get("/", (req, res) => {
  res.status(200).send({ Success: "you Got Root" });
});

//Logging
app.use(morgan("combined"));
app.use(
  morgan("common", {
    stream: fs.createWriteStream("./access.log", { flags: "a" })
  })
);

// CORS Allowed, if app sends request to thirdparty we need CORS or will get an error.
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/notification", notification);
app.use("/api/posts", posts);
app.use("/api/comments", comments);

// Schedule to send emails and SMS to users on specific date.
require("./notifications/email-scheduler");
require("./notifications/sms-twillio-scheduler");
// require("./notifications/email-schedular-1day-advance");
// require("./notifications/datetest");

const port = process.env.PORT || 5000;

app.listen(port, err => {
  if (err) {
    return console.log(`Error: ${err}`);
  }
  console.log(`MERN Front2Back App is listening on ${port}`);
});
