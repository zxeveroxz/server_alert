const express  = require("express");
const router = express.Router();

// Home page route.
router.get("/", function (req, res) {
  res.send("JSJ CONSULTORES");
});

// About page route.
router.get("/chat", function (req, res) {
  res.sendFile(__dirname+"/publico/cliente.html")
});

module.exports = router;
