const express = require("express");
const { getAllTransactions, getUserTransaction, deleteTransaction } = require("../transactions/transaction.controller");
const { verifyToken } = require("../auth/otp.controller");
const { getYakaDetails } = require("./api");
const { createYakaAccount, validateNumber, mobileMoneyPay } = require("./payments.controller");
const { updateTransactionByInternalRef, getTransactionById } = require("../transactions/transaction.service");
const { deposit, depositApi, depositFailed } = require("./utils");
const { sendPushNotification } = require("../utils/sendPushNotifications");
const router = express.Router();

router.get("/yaka/info/:meter", getYakaDetails);
router.post("/yaka/info", createYakaAccount);
router.get("/validate/:msisdn", validateNumber);
router.post("/mobile-money", verifyToken, mobileMoneyPay);
router.post('/webhook', async (req, res) => {
    const { status, message, customer_reference, internal_reference, msisdn, amount, currency, provider, charge } = req.body;
    console.log('Webhook received:', {
        status,
        message,
        customer_reference,
        internal_reference,
        msisdn,
        amount,
        currency,
        provider,
        charge,
    });
    if (status.toLowerCase() === 'success') {
        await depositApi({ amount, infoMessage: message, provider, transactionId: internal_reference })
    } else  {
        await depositFailed({ internal_reference, message, provider })
    }
    
    res.status(200).send('OK');
})

// router.get("/:transactionId", verifyToken, getUserTransaction);
// router.delete("/:transactionId", verifyToken, deleteTransaction);

module.exports = router;
