const { Router } = require("express");
const { login, signup, logout } = require("../controllers/auth.controller");

router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
