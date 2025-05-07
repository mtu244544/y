const { ugx } = require("../../utils");

exports.loanLimitFlow = ({ body, user }) => {
  const data = body.text.split("*");
  switch (data.length) {
    case 3:
      if (data[2] !== user.pin) {
        // TODO: Re enter pin allow
        return `END Invalid PIN please enter a correct PIN`;
      }
      if (data[2] === user.pin) {
        return `END Your Reserve is UGX ${ugx(user.limit)}`;
      }
      break;
    default:
      switch (body.text) {
        case "5*2":
          return `CON Enter your PIN to confirm`;
        case "5":
          return `CON Enter YoPIN to confirm`;
        default:
          return `END Invalid request`;
      }
  }
};
