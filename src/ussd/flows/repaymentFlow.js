const { DateTime } = require("luxon");
const { ugx, sText } = require("../../utils");

exports.repaymentFlow = async ({ body, user }) => {

  const steps = `Send ${ugx(Math.abs(user.balance))} to 0770383841 using ${user.phoneNumber.replace('+256', '0')}
Your Yobo account balance will be automatically updated`;

  try {
    switch (body.text.split("*").length) {
      case 2:
      case 3:
      case 4:
      case 5:
        if (body.text.split("*")[body.text.split("*").length - 1] == user.pin) {
          if (Number(user.balance) >= 0) {
            return `END You have no outstanding Debts`;
          }
          return `END Your Due Date: ${DateTime.fromMillis(user.dueDate).toFormat("MMM d, yyyy")}\n${steps}`;
        }
        if (body.text.split("*").length === 5) {
          return `END Invalid YOBO PIN try again`;
        }
        return `CON Invalid PIN\nEnter a valid 4 digits YOBO PIN`;

      case 1:
        return `CON Enter YOBO PIN to confirm`;
      default:
        return `END Invalid request`;
    }
  } catch (error) {
    console.log('===error==', error.message);
    return `END Invalid request`;
  }
};
