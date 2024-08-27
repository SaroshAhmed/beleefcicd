// routes/auth.js
const express = require("express");
const passport = require("passport");
const Session = require("../../../models/Session");
const { REACT_APP_FRONTEND_URL } = require("../../../config");
const router = express.Router();


// Google Auth Routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${REACT_APP_FRONTEND_URL}/login`,
  }),
  function (req, res) {
    res.redirect(`${REACT_APP_FRONTEND_URL}`);
  }
);

router.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user)
    return res.status(200).json({ success: true, data: req.user });
  } else {
    return res.status(200).json({ success: false, data: null });
  }
});


// Logout
router.get("/logout", async (req, res, next) => {
  try {
    // Get the current session ID
    const sessionId = req.sessionID;

    // Delete the session from the MongoDB collection using the sessionId field
    await Session.findOneAndDelete({ sessionId });

    // Destroy the session in the session store
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }

      // Clear the cookie
      res.clearCookie("connect.sid", { path: "/" });

      // Send a response back to the client
      res.status(200).json({ success: true, message: "Logout successful" });
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
