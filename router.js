const express  = require("express");
const router = express.Router();

// Home page route.
router.get("/", function (req, res) {
  res.send("Sergio Zegarra");
});

// About page route.
router.get("/chat", function (req, res) {
  res.render("./public/cliente")
});

module.exports = router;
