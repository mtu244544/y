const express = require("express");
const { getAllTransactions, getUserTransaction, deleteTransaction, getUserTransactions } = require("../transactions/transaction.controller");
const { verifyToken } = require("../auth/otp.controller");
const router = express.Router();

router.get("/user/me", verifyToken, getUserTransactions);
router.get("/", getAllTransactions);
router.get("/:transactionId", verifyToken, getUserTransaction);
router.delete("/:transactionId", verifyToken, deleteTransaction);

module.exports = router;
