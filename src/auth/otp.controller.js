const catchAsync = require("../utils/catchAsync");
const userService = require("../users/user.service");
const { generateOtp, verifyCode, sendSMS } = require("../sms/sms.service");
const db = require("../firebase/config");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const { getSettings } = require("../settings");
const { DateTime } = require('luxon');
const { validatePhone } = require("../payments/api");
const User = db.collection("users");

// Middleware to create and send an OTP
const createOtp = catchAsync(async (req, res) => {
  const { code } = await generateOtp(req.params.phoneNumber);
  console.log('====', req.body.hash)
  await sendSMS({
    to: req.params.phoneNumber,
    message: `<#> ${code} is your AUTH verification code\nRef:${req.body.hash}.`,
  });
  res.status(200).send({ status: 200, message: 'verification message has been sent' });
});

// Middleware to verify OTP and user PIN
const verifyOtp = catchAsync(async (req, res) => {
  const { phoneNumber, code } = req.params;
  const isValid = await verifyCode(phoneNumber, code, !req.body.pin);
  if (req.query?.register) {
    const data = await validatePhone(phoneNumber);
    await User.doc(phoneNumber).set({ phoneNumber, phoneNumberNames: data.customer_name });
  }
  if (!isValid) {
    throw new ApiError(400, "Invalid OTP Code");
  }
  if (req.body.pin) {
    const user = await userService.getUserByPhoneNumber(phoneNumber);

    if (!user) {
      throw new ApiError(422, "User Verification Failed");
    }
    await userService.verifyUser(phoneNumber, req.body.pin);
    return res.status(200).send({ status: 200, message: "User Verified Successfully!" });
  } else {
    return res.status(200).send({ status: 200, message: "Code Validated Successfully!" });
  }
});

// Middleware to handle user login
const userLogin = catchAsync(async (req, res) => {
  const { phoneNumber } = req.body;
  let user = await userService.getUserByPhoneNumber(phoneNumber);

  if (!user) {
    throw new ApiError(404, "Accout not found");
  }

  if (user.pin !== req.body.pin) {
    throw new ApiError(401, "Invalid login details");
  }

  const token = jwt.sign(
    {
      name: user.name,
      phoneNumber,
      role: user.role,
      verified: user.verified,
      accountType: user.accountType,
    },
    process.env.APP_SECRET,
    {
      expiresIn: "2h",
    }
  );

  res.cookie("access-token", token, { httpOnly: true });
  if(req.headers.fcmtoken){
    await userService.updateUser(user.phoneNumber, { fcmtoken: req.headers.fcmtoken })
  }
  const settings = await getSettings();
  if (user.dueDate < Date.now() && user.balance >= 0) {
    const dueDate = DateTime.now().plus({ months: 1 }).set({ day: user.payDay }).toMillis()
    await userService.updateUser(user.phoneNumber, { dueDate })
    user = await userService.getUserByPhoneNumber(phoneNumber);
  }
  const { pin, ...data } = user;
  return res.status(200).send({ message: "Access granted", token, user: data, settings: { baseAmount: settings.baseAmount, limits: settings.limits[data.accountType] } });
});

// Middleware to validate a phone number and check if it's verified
const validatePhoneNumber = catchAsync(async (req, res) => {
  const { phoneNumber } = req.params;
  const user = await userService.getUserByPhoneNumber(phoneNumber);
  if (user) {
    const { pin, ...rest } = user;
    res.status(200).send({ status: 200, data: rest });
  } else {
    throw new ApiError(401, "PhoneNumber Not Registered or Invalid");
  }
});

function verifyToken(req, res, next) {
  const token = req.headers.cookie?.replace(/access-token=/, "") || req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  // Verify the token
  return jwt.verify(token, process.env.APP_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Invalid token" });
    }
    req.user = decoded;
    return next();
  });
}

module.exports = {
  verifyToken,
  createOtp,
  verifyOtp,
  userLogin,
  validatePhoneNumber,
};
