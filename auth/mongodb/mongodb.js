const mongoose = require('mongoose');
const mongoAuth = require('../../config/Keys').mongoAuth;
const mongoMERNFRONT2BACK = require('../../config/Keys').mongoMERNFRONT2BACK;
const Grid = require('gridfs-stream');
mongoose.Promise = global.Promise;

// Simple mongoose.connect to only open single connection to db.
mongoose
  .connect(
    mongoMERNFRONT2BACK,
    { useNewUrlParser: true }
  )
  .then(err => {
    console.log('mLab MongoDB Connected MERNFRONT2BACK DB!');
  })
  .catch(err => {
    console.log(`Error: Connecting MongoDB ${err}`);
  });

// GridFS stream ... it should be executed in route where needed.

// DB createConnection can not have .then( ) if we want to open conn.once for Gridfs ..
// let gfs;
// const conn = mongoose.createConnection(mongoAuth);
// gridfs-stream opening another connection to mongodb to upload files ..

// conn
//   .once("open", err => {
//     gfs = Grid(conn.db, mongoose.mongo);
//     gfs.collection("uploads");
//   })
//   .catch(err => {
//     res.json(err);
//   });

// module.exports = conn;
