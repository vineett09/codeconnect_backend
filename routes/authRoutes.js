const express = require("express");
const {
  registerUser,
  loginUser,
  checkUsernameController,
} = require("../controllers/authController");
const admin = require("../firebaseAdmin");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);

router.post("/check-username", checkUsernameController);
router.post("/google-login", async (req, res) => {
  const { uid, email, displayName } = req.body;

  try {
    // Verify the token and get user data
    const userRecord = await admin.auth().getUser(uid);

    // Check if user exists in your MongoDB
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user if not exists
      user = new User({ email, username: displayName, password: "" });
      await user.save();
    }

    // Generate a custom token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ success: true, token, user });
  } catch (error) {
    console.error("Error verifying Google Sign-In:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
