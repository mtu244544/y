const { getCredit } = require("./flows/getCreditFlow");
const { loanBalanceFlow } = require("./flows/loanBalanceFlow");
const { loanLimitFlow } = require("./flows/loanLimitFlow");
const { repaymentFlow } = require("./flows/repaymentFlow");
const { getFuel } = require("./flows/getFuel");
const { deposit } = require("./flows/deposit");
const { ussdType } = require("../utils");
const { pricingFlow } = require("./flows/pricingFlow");
const { accountHistory } = require("./flows/accountHistory");

const createSession = async (req, res) => {
  const { GET_FUEL, DEPOSIT, REPAYMENT, BORROW_FUEL, RESERVE_BALANCE, RESERVE_LIMIT, ACCOUNT, PRICING, ACCOUNT_HISTORY } = ussdType;
  switch (req.type) {
    case GET_FUEL:
      return res.send(await getFuel(req));
    case BORROW_FUEL:
      return res.send(await getCredit(req));
    case DEPOSIT:
      return res.send(await deposit(req));
    case REPAYMENT:
      return res.send(await repaymentFlow(req));
    case RESERVE_BALANCE:
      return res.send(await loanBalanceFlow(req));
    case RESERVE_LIMIT:
      return res.send(await loanLimitFlow(req));
    case ACCOUNT_HISTORY:
      return res.send(await accountHistory(req));
    case PRICING:
      return res.send(await pricingFlow(req.body));
    case ACCOUNT:
      return res.send(`CON Account Management\n1. Account Balance\n2. Reserve Balance\n3. Account History`);
    default:
      return res.send(`CON Welcome to Yobo By Hawa\n1. Get Fuel\n2. Borrow Fuel\n3. Deposit\n4. Repay Fuel\n5. My Account\n6. Withdraw Charges`);
  }
};

module.exports = {
  createSession,
};
