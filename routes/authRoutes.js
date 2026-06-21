const { Router } = require("express");
const { loginValidators } = require("../validators/authValidators");
const validateRequest = require("../middleware/validateRequest");
const { login, logout } = require("../controllers/authController");

const router = Router();

router.post("/login", loginValidators, validateRequest, login);
router.post("/logout", logout);

module.exports = router;
