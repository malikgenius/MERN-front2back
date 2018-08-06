const mongoose = require("mongoose");
const Keys = require("../config/Keys").mongoURI;
const KeysLocal = require("../config/Keys").mongoLOCAL;

mongoose
  // .connect(Keys)   //mLab mongodb connection --- just uncomment this to connect mLAB
  .connect(KeysLocal)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch(err => {
    console.log(err);
  });
