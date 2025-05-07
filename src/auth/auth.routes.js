const express = require("express");
const { createOtp, verifyOtp, userLogin, validatePhoneNumber, verifyToken } = require("./otp.controller");
const { validate } = require("../utils/validator");
const { createUser } = require("../users/user.controller");
const router = express.Router();

router.post("/otp/verify/:phoneNumber/:code", validate, verifyOtp);
router.post("/otp/generate/:phoneNumber", validate, createOtp);
router.post("/login", userLogin);
router.post("/register", createUser);
router.post("/validate/:phoneNumber", validate, validatePhoneNumber);

module.exports = router;
