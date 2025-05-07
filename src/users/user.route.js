const express = require("express");
const { createUser, getUsers, getUser, deleteUser, getUserProfile, verifyUserInfo } = require("./user.controller");
const { validate } = require("../utils/validator");
const { verifyToken } = require("../auth/otp.controller");
const router = express.Router();

router.post("/", createUser);
router.get("/", verifyToken, getUsers);
router.get("/me",verifyToken, getUserProfile);
router.get("/phone/:phoneNumber", validate, getUser);
router.patch("/kyc/verify/:phoneNumber", validate, verifyUserInfo);
router.delete("/:phoneNumber", validate, deleteUser);

module.exports = router;
