const { getPricingList } = require("../settings");

exports.getRate = async (value, borrow) => {
  const pricing = await getPricingList()
  if (borrow) {
    const rate = Object.entries(pricing).reduce((acc, [rate, [min, max]]) => {
      if (value >= min && value <= max) return rate;
      return acc;
    }, 0);
    return Number(rate);
  } else {
    return 0;
  }
};
