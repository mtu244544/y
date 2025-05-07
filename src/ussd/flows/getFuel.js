const { getRate } = require("../../jobs/pricing");
const { confirmGetFuel } = require("../../sharedServices/shared");
const { ugx } = require("../../utils");

exports.getFuel = async (req) => {
  const { body, user, config } = req;
  const { text, amount } = body;
  const pin = req.body.text.split("*")[req.body.text.split("*").length - 1];
  try {
    switch (text.split("*").length) {
      case 1:
        return `CON Enter amount of Fuel between(UGX ${ugx(config.baseAmount)} to UGX ${ugx(user.balance)})`;
      case 2:
        return `CON MOMOPAY\nAmount: UGX ${ugx(amount)}\nEnter MOMOPAY Code for Station`;
      case 3:
        const charge = await getRate(amount)
        return `CON Fuel: UGX ${ugx(amount)}\nCharge: UGX ${ugx(charge)}\nStation: ${body.station}\nEnter YOBO PIN to confirm`;
      case 4:
      case 5:
      case 6:
      case 7:
        if (pin && pin == user.pin) {
          confirmGetFuel(req, "USSD");
          return `END Your request has been received. Please wait as we process your payment.`;
        }
        if (req.body.text.split("*").length === 7) {
          return `END Invalid PIN try again thank you!`;
        }
        return `CON Invalid PIN\nEnter a valid 4 digits YOBO PIN`;
      default:
        return `END Invalid request try again`;
    }
  } catch (error) {
    return `END Invalid request`;
  }
};
