const { Router } = require("express");
const {
  login,
  signup,
  logout,
  verifyEmail,
} = require("../controllers/auth.controller");

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
module.exports = router;
