const { ussdType, ugx } = require(".");
const { getUserByPhoneNumber } = require("../users/user.service");
const validate = require("./validationScript");
const { getRate } = require("../jobs/pricing");
const { checkDailyWithdrawalLimit } = require("./checkDailyWithdrawalLimit");
const { getSettings } = require("../settings");

exports.validate = async (req, res, next) => {
  const { phoneNumber, msisdn, amount } = req.body;
  console.log('=======0')
  const config = await getSettings();
  if (phoneNumber || req.params.phoneNumber || msisdn) {
    if (!(phoneNumber || req.params.phoneNumber || msisdn).match(/^\+256(?:78|77|76|75|74|70|20|39)\d{7}$/)) {
      return res.status(400).send({ status: 400, error: "Invalid Phone Number" });
    }
    console.log('=======1')
    if (amount) {
      const user = await getUserByPhoneNumber(phoneNumber);
      if (typeof amount !== "number" || amount < config.baseAmount) {
        return res.status(400).send({ status: 400, message: "invalid amount value" });
      }
      req.user = user;
      console.log('=======2')
      req.config = config;
      return next();
    }
    console.log('=======3')
    return next();
  }
};

exports.validateBorrowing = async (req, res, next) => {
  const charge = req.body.amount ? await getRate(req.body.amount, true) : 0;
  const dailyLimit = await checkDailyWithdrawalLimit(req.user, req.body.amount)
  if (req.user?.dueDate <= Date.now()) {
    const error = `Dial *284*89*3# to pay your outstanding debt first`;
    return res.status(400).send(req.body.text ? `END ${error}` : { status: 400, error });
  }
  if (req.user.limit === 0 || req.user.limit - charge < req.config.baseAmount) {
    const error = `You have less reserve Fuel`;
    return res.status(400).send(req.body.text ? `END ${error}` : { status: 400, error });
  }
  if (req.user.limit < req.body.amount) {
    const error = `Invalid Amount try again`;
    return res.status(400).send(req.body.text ? `END ${error}` : { status: 400, error });
  }
  if (dailyLimit) {
    const error = `You have exceeded Daily Limit of UGX ${ugx(dailyLimit)}`;
    return res.status(400).send(req.body.text ? `END ${error}` : { status: 400, error });
  }
  if (req.user.limit !== 0 && req.body.amount + charge > req.user.limit) {
    const error = `You reserve is less Get UGX ${ugx(req.user.limit - charge)}. since the Charge is UGX ${ugx(charge)}`;
    return res.status(400).send(req.body.text ? `END ${error}` : { status: 400, error });
  }
  if (req.type && req.type !== ussdType.BORROW_FUEL) return next();
  if (req.type && !req.body.text) return next();
  const err = validate(
    req.body,
    {
      phoneNumber: { req: !req.body.text, phoneNumber: true },
      amount: {
        req: !req.body.text,
        num: true,
        min: req.config.baseAmount,
        max: req.user.limit,
        ineligible: req.body.amount && !(req.body.amount > req.user.balance - charge) && !(req.body.amount > req.user.limit - charge),
      },
      merchantId: { req: !req.body.text, num: true, minLength: 6, maxLength: 7 },
    },
    charge,
    (error) => error
  );
  if (err) return res.status(400).send(req.body.text ? `END ${err}` : { status: 400, errors: err });
  next();
};

exports.validateGetFuel = async (req, res, next) => {
  if (req.type && !req.body.text) return next();
  const charge = req.body.amount ? await getRate(req.body.amount) : 0;
  const err = validate(
    req.body,
    {
      phoneNumber: { req: !req.body.text, phoneNumber: true },
      merchantId: { req: !req.body.text, num: true, minLength: 6, maxLength: 7 },
      amount: {
        req: !req.body.text,
        num: true,
        min: req.config?.baseAmount,
        max: req.user.balance - charge,
      },
    },
    charge,
    (error) => error
  );
  if (req.config.baseAmount > req.user.balance - charge) {
    const error = "Insufficient balance!! use Borrowing option";
    return res.status(400).send(req.body.text ? `END ${error}` : { status: 400, error });
  }
  if (err) return res.status(400).send(req.body.text ? `END ${err}` : { status: 400, errors: err });
  next();
};

exports.validateRepayment = ({ data, user }) => {
  if (data.pin && data.pin !== user.pin) return `END Invalid YOBO PIN try again`;
  if (data.paymentMethod && data.paymentMethod.match(/^(1|2)$/)) return `END Invalid request`;
};
