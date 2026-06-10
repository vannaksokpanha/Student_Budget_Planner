const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

router.get("/home", verifyToken, (req, res) => {
  console.log("User data from token:", req.user);
  

  return res.status(200).json({ message: "Token verified"  });
});

module.exports = router;

