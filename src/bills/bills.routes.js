const express = require("express");
const { getYakaDetails, createBillsAccount, getBillAccounts, getWaterAccountDetails, getDstvAccountDetails, getGotvAccountDetails, makeYakaPayment, buyAirtime } = require("./bills.controller");
const router = express.Router();

router.get("/yaka/info/:account", getYakaDetails);
router.post("/airtime", buyAirtime);
router.post("/yaka/pay", makeYakaPayment);
router.get("/water/info/:account", getWaterAccountDetails);
router.get("/tv/info/:provider/:subscription/:account", getDstvAccountDetails);
router.get("/tv/:provider/pay", getDstvAccountDetails);
router.post("/", createBillsAccount);
router.get("/", getBillAccounts);

// router.get("/", getWaterAccountDetails);
// router.get("/water/info/:meter", getWaterDetails);
// router.post("/water/info", createWaterAccount);


module.exports = router;

