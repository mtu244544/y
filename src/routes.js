const express = require("express");
const router = express.Router();
const userRoute = require("./users/user.route");
const ussdRoute = require("./ussd/ussd.route");
const whatsappRoute = require("./whatsapp/whatsapp.route");
const stationRoute = require("./stations/station.route");
const transactionRoute = require("./transactions/transaction.route");
const coreRoute = require("./core/route");
const authRouter = require("./auth/auth.routes");
const settingsRouter = require("./settings/settings.routes");
const stats = require("./stats");
const { repay } = require("./payments/api");
const { verifyToken } = require("./auth/otp.controller");
const { deposit } = require("./payments/utils");
const paymentRoutes = require("./payments/payments.routes");
const { sendSMS } = require("./sms/sms.service");
const { sendSMSNotification } = require("./notification");
const storage = require("./storage/storage");
const bills = require("./bills/bills.routes");
const kyc = require("./kyc/kyc.routes");


router.use("/auth", authRouter);
router.use("/ussd", ussdRoute);
router.use("/users", userRoute);
router.use("/whatsapp", whatsappRoute);
router.use("/stations", stationRoute);
router.use("/fuel", coreRoute);
router.use("/transactions", transactionRoute);
router.use("/settings", settingsRouter);
router.get("/stats", verifyToken, stats);
router.get("/notify/:type", sendSMSNotification)
router.post('/repay', repay);
router.use('/upload', storage);
router.use('/bills', bills);
router.use('/kyc', kyc);
router.use("/payments", paymentRoutes);

router.post('/paid', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(401).send({ status: 401, error: 'unauthorized' })
    try {
        await deposit({
            amount: Number(req.body.amount),
            phoneNumber: req.body.phoneNumber,
            transactionId: String(Date.now())
        })
        return res.status(200).send({ status: 200, message: 'operation successful' })
    } catch (error) {
        return res.status(422).send({ status: 422, error: error.message })
    }
});

module.exports = router;
