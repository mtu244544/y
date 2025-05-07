const { DateTime } = require("luxon");
const { sText, ugx } = require("../../utils");

exports.loanBalanceFlow = async ({ body, user, ...req }) => {
  const data = body.text.split("*");

  switch (data.length) {
    case 3:
      if (data[2] !== user.pin) {
        // TODO: Re enter pin allow
        return `END Invalid PIN please enter a correct PIN`;
      }
      if (data[2] === user.pin) {
        return `END Account Balance UGX ${ugx(user.balance)}${user.balance < 0 ? " Due Date: " + DateTime.fromMillis(user.dueDate).toFormat("MMM d, yyyy HH:mm") : ""}`;
      }
      break;
    default:
      switch (body.text) {
        case "5*1":
          return `CON Enter your PIN to confirm`;
        case "5":
          return `CON Enter YoPIN to confirm`;
        default:
          return `END Invalid request`;
      }
  }
};
