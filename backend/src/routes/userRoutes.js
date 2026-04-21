const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const role = req.query.role;
    if (req.user.role === "patient" && role === "patient") {
      return res.status(403).json({ message: "Patients are not allowed to view other patients" });
    }
    const query = role ? { role } : {};

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
