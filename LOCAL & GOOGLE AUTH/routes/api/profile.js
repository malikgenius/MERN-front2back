const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ Profiles: "You have reached to Profile Route" });
});

module.exports = router;
