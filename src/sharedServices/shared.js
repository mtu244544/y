const { updateBalance } = require("../wallet/wallet.service");
const { mergeRequestBody, ugx } = require("../utils");
const { DateTime } = require("luxon");
const { getRate } = require("../jobs/pricing");
const { sendSMS } = require("../sms/sms.service");
const { createTransaction, updateTransactionById } = require("../transactions/transaction.service");
const { payNow } = require("../payments/api");
const { sendPushNotification } = require("../utils/sendPushNotifications");
const { error } = require("firebase-functions/logger");

const handleErrors = ({ phoneNumber, fcmtoken, type }) => {
  sendPushNotification(fcmtoken, {
    notification: {
      title: 'Payment Failed!',
      body: 'We are unable to process your fuel request at this time. Please try again later.',
    }, data: { status: 'FAILED', subtitle: type, provider: 'MTN' },
  })
  sendSMS({
    to: phoneNumber,
    message: `We are unable to process your fuel request at this time. Please try again later.`,
  });
};

exports.confirmBorrowFuel = async (req, type) => {
  try {
    if (type === "USSD") mergeRequestBody(req);
    const { phoneNumber, amount, station, merchantId } = req.body;
    console.log('======3')
    const response = await makePayments({ phoneNumber, amount, merchantId, user: req.user, station }, true);
    console.log('======3.1')
    return response;
  } catch (error) {
    console.log("confirmBorrowFuel:", error.message);
    throw Error(error)
  }
};

exports.confirmGetFuel = async (req, type) => {
  try {
    if (type === "USSD") mergeRequestBody(req);
    const { phoneNumber, amount, merchantId, station } = req.body;
    
    const response = await makePayments({ phoneNumber, amount, merchantId, user: req.user, station });
    
    return response;
  } catch (error) {
    console.log("confirmGetFuel:", error);
    // throw Error(error)
  }
};

async function makePayments({ phoneNumber, amount, merchantId, station, user }, borrow) {
  try {
    const charge = await getRate(amount, borrow);
    const { id } = await createTransaction({
      phoneNumber,
      amount: Number(amount),
      charge,
      station,
      merchantId,
      provider: merchantId?.length === 7 ? 'AIRTEL PAY' : 'MOMOPAY',
      status: "PENDING",
      type: borrow ? "BORROW_FUEL" : "GET_FUEL",
      createdAt: Date.now(),
    });
    const { transactionId, error } = await payNow({ merchantId, amount });
    if (!error) {
      updateTransactionById(id, { status: "COMPLETE", transactionId });
      const { totalCharge } = await updateBalance({
        phoneNumber: phoneNumber,
        amount: -(Math.abs(amount) + Number(charge)),
        getFuel: !borrow,
      });

      const date = DateTime.now().toFormat("MMM d, yyyy 'at' h:mma");
      const message = `Paid! UGX ${ugx(amount)} to ${station} charge UGX ${ugx(parseInt(charge))} ${borrow && "Reserve Balance is UGX " + ugx(user.limit - totalCharge)} ID ${transactionId}\nEnjoy your ride !!!.\ndate: ${date}`;
      sendSMS({
        to: phoneNumber,
        message: message,
      });
      return {
        message,
        transactionId,
        amount,
        station,
        phoneNumber: phoneNumber,
        charge,
        totalCharge,
        date: new Date().toISOString(),
      };
    } else {
      updateTransactionById(id, { status: "FAILED" });
      handleErrors({ phoneNumber, fcmtoken: user.fcmtoken, type: "Get Fuel", });
      throw Error(`We are unable to process your fuel request at this time.`)
    }

  } catch (err) {
    // handleErrors(phoneNumber, user.fcmtoke);
    console.log(`We are unable to process your fuel request at this time.`)
  }
}
