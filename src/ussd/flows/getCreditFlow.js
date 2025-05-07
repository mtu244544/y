const { ugx } = require("../../utils");
const { confirmBorrowFuel } = require("../../sharedServices/shared");
const { getRate } = require("../../jobs/pricing");

exports.getCredit = async (req) => {
  const { amount, station } = req.body;
  if (req.body.amount) {
    if (req.user.balance > req.body.amount) {
      const error = `You have enough balance for this transaction`;
      return `END ${error}`;
    }
  }
  const len = req.body.text.split("*").length;
  const pin = req.body.text.split("*")[req.body.text.split("*").length - 1];
  try {
    switch (len) {
      case 1:
        // return `END System is under maintenance we shall update you when it gets back online`;
        return `CON Enter amount of Fuel between(${ugx(req.config.baseAmount)} to ${ugx(req.user.limit)}) UGX`;
      case 2:
        return `CON MOMOPAY\nAmount: UGX ${ugx(amount)}\nEnter MOMOPAY Code for Station`;
      case 3:
        const charge = await getRate(amount, true)
        return `CON Fuel: UGX ${ugx(amount)}\nCharge: UGX ${ugx(charge)}\nStation: ${station}\nEnter YOBO PIN to confirm`;
      case 4:
      case 5:
      case 6:
      case 7:
        if (pin && pin == req.user.pin) {
          confirmBorrowFuel(req, "USSD");
          return `END Your request has been received. Please wait as we process your payment.`;
        }
        if (req.body.text.split("*").length === 7) {
          return `END Invalid PIN try again thank you!`;
        }
        return `CON Invalid PIN\nEnter a valid 4 digits YOBO PIN`;
      default:
        return `END Invalid request`;
    }
  } catch (error) {
    console.log("======", error.message);
    return `END Invalid request`;
  }
};
