const { DateTime } = require("luxon");

exports.sText = (body, v) => (isNaN(body.text.split("*")[v]) ? 0 : Number(body.text.split("*")[v]));
exports.getDueDate = ({ config, user }) => {
  return user?.dueDate ? DateTime.fromJSDate(new Date(user?.dueDate)) : DateTime.now().plus({ days: config.limits[user.accountType].duration });
};

exports.mergeRequestBody = (req) => {
  req.body = {
    ...req.body,
    amount: this.sText(req.body, 1),
    merchantId: this.sText(req.body, 2),
  };
};

exports.ussdType = {
  GET_FUEL: "GET_FUEL",
  DEPOSIT: "DEPOSIT",
  REPAYMENT: "REPAYMENT",
  BORROW_FUEL: "BORROW_FUEL",
  RESERVE_BALANCE: "RESERVE_BALANCE",
  RESERVE_LIMIT: "RESERVE_LIMIT",
  ACCOUNT: "ACCOUNT",
  MAIN_MENU: "MAIN_MENU",
  ACCOUNT_HISTORY: "ACCOUNT_HISTORY",
  PRICING: "PRICING",
};

exports.getRequestType = (text) => {
  switch (true) {
    case text === "1" || text?.startsWith("1*"):
      return "GET_FUEL";
    case text === "2" || text?.startsWith("2*"):
      return "BORROW_FUEL";
    case text === "3" || text?.startsWith("3*"):
      return "DEPOSIT";
    case text === "4" || text?.startsWith("4*"):
      return "REPAYMENT";
    case text?.startsWith("5*1"):
      return "RESERVE_BALANCE";
    case text?.startsWith("5*2"):
      return "RESERVE_LIMIT";
    case text?.startsWith("5*3"):
      return "ACCOUNT_HISTORY";
    case text === "5":
      return "ACCOUNT";
    case text === "6":
      return "PRICING";
    default:
      return "MAIN_MENU";
  }
};
exports.ugx = (amount) => Math.floor(amount).toLocaleString();

exports.stationsKeywords = [
  "station",
  "mopetro",
  "torch",
  "igar",
  "gas",
  "petrol",
  "service",
  "filling",
  "refueling",
  "depot",
  "gasoline",
  "energy",
  "vivo",
  "energies",
  "total",
  "shell",
  "gaz",
  "stabex",
  "ass",
  "hass",
  "bam",
  "agip",
  "luqman",
  "oil",
  "petroleum",
  "gapco",
  "kobil",
  "denis",
  "caltex",
  "halimah",
  // Add more alternatives as needed
];

exports.isFuelStation = (phrase) => {
  const lowerCasePhrase = phrase?.toLowerCase();

  return this.stationsKeywords.reduce((matchFound, keyword) => {
    if (matchFound) {
      return true;
    }
    return lowerCasePhrase?.includes(keyword);
  }, false);
};
