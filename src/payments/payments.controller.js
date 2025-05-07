const db = require("../firebase/config");
const { createTransaction } = require("../transactions/transaction.service");
const { validatePhone, mobileMoneyPayment } = require("./api");
const User = db.collection("users");


exports.createYakaAccount = async (req, res) => {
    const user = await User.doc(userBody.phoneNumber).set({
        billsAccounts: []
    });

}

exports.validateNumber = async (req, res) => {
    try {
        const data = await validatePhone(req.params.msisdn);
        return res.status(200).send({ status: 200, data })
    } catch (error) {
        console.error('Error in validateNumber:', error.message);
        return res.status(500).send({ status: 500, error: error.message });
    }

}

exports.mobileMoneyPay = async (req, res) => {
    try {
        const { msisdn, amount } = req.body
        const data = await mobileMoneyPayment({ msisdn, amount });
        await createTransaction({
            phoneNumber: req.user.phoneNumber,
            internal_reference: data.internal_reference,
            amount: Number(amount),
            msisdn,
            charge: 0,
            status: "PENDING",
            type: "DEPOSIT",
            createdAt: Date.now(),
          });
        return res.status(200).send({ status: 200, data })
    } catch (error) {
        console.log(error.message)
        return res.status(422).send({ status: 422, error: 'Unable to process your transaction' });
    }
}
