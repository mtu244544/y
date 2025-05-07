
const { userTransactions } = require("../../transactions/transaction.service");
const { DateTime } = require("luxon");
const { ugx } = require("../../utils");

exports.accountHistory = async ({ body, user }) => {
  const data = body.text.split("*");
  if (data.length === 2) {
    return `CON Enter YoPIN to confirm`;
  }
  if (data.length === 3) {
    if (data[2] !== user.pin) {
      // TODO: Re enter pin allow
      return `END Invalid PIN please enter a correct PIN`;
    }
    if (data[2] === user.pin) {
      const loans = await userTransactions(user);
      return `END Account History\n${loans
        .map((loan, i) => `${i + 1}. ${DateTime.fromMillis(loan.createdAt).toLocaleString(DateTime.DATETIME_SHORT)} ~ UGX ${ugx(loan.amount)} from ${loan?.station?.split(' ')[0]}\n`)
        .join("")}`;
    }
  }

};
