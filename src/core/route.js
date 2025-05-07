const express = require("express");
const { getUserDebts, getAllDebts, deleteDebt, requestPay, borrowFuel, chargeFuel, getPricing } = require("./controller");
const { validate, validateBorrowing, validateGetFuel } = require("../utils/validator");
const { getStationById } = require("./middleware");
const { verifyToken } = require("../auth/otp.controller");

const router = express.Router();

router.post("/borrow", verifyToken, validate, validateBorrowing, borrowFuel);
router.post("/get", verifyToken, validate, validateGetFuel, chargeFuel);
router.post("/station/:merchantId", getStationById);
router.get("/:phoneNumber", verifyToken, validate, getUserDebts);
router.get("/", verifyToken, getAllDebts);
router.delete("/delete", verifyToken, deleteDebt);
router.get("/pricing/list", verifyToken, getPricing);

module.exports = router;
