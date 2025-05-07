exports.deposit = (req) => {
  return `END Send Money to 0770383841 using ${req.body.phoneNumber?.replace('+256', "0")}
Your Yobo account balance will be automatically updated`;
};
