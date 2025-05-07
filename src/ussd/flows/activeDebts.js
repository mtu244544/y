const { sText } = require("../../utils");
const { getUserDebts } = require("../../debts/debt.service");
const { DateTime } = require("luxon");

exports.activeDebts = async ({ body }) => {
  const loans = await getUserDebts(body.phoneNumber, {
    paid: false,
  });
  return `END Account History\n${loans
    .map((loan, i) => `${i + 1}. UGX ${loan.amount} ~ ${DateTime.fromISO(loan.createdAt).toLocaleString(DateTime.DATETIME_SHORT)} from ${loan.station}\n`)
    .join("")}`;
};
