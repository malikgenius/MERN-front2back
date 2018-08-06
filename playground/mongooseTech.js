// How to match saved Id in user or any model with objectId of db. 
// first define ObjectId  .. then for example gfs.files.findOne = as gfs doesnt let us findById 
let ObjectId = require("mongoose").Types.ObjectId;
    gfs.files.findOne({ _id: new ObjectId(req.user.avatarId) }

