const mongoose = require("mongoose");
// const mongoAuth = require("../../config/Keys").mongoAuth;
const Grid = require("gridfs-stream");

// DB
const mongoDB = "mongodb://127.0.0.1:27017/auth";
// createConnection = we can open multiple connections to mongodb, with only mongoose.connect there will be single connection.
// for Gridfs stream we need createConnection to open multiple ..
let gfs;
const conn = mongoose
  .createConnection(mongoDB, { useNewUrlParser: true })
  .then(err => {
    console.log("Local MongoDB Connected Auth DB!");
  })
  .catch(err => {
    console.log(`Error: Connecting MongoDB ${err}`);
  });

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

module.exports = conn;

// Simple mongoose.connect to only open single connection to db.
// mongoose
// .connect(mongoAuth)
// .then(err => {
//   console.log("Local MongoDB Connected Auth DB!");
// })
// .catch(err => {
//   console.log(`Error: Connecting MongoDB ${err}`);
// });
