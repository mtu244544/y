const axios = require("axios");
const dotenv = require("dotenv");
const db = require("../firebase/config");
const { DateTime } = require("luxon");

dotenv.config();

const credentials = {
  apiKey: process.env.SMS_API_KEY, // use your sandbox app API key for development in the test environment
  username: process.env.SMS_USERNAME, // use 'sandbox' for development in the test environment
};

const AfricasTalking = require("africastalking")(credentials);
const sms = AfricasTalking.SMS;

const OTP = db.collection("otp");

const generateOtp = async (phoneNumber) => {
  try {
    const code = Math.random()
      .toString()
      .slice(2, 4 + 2);
    const expiry = DateTime.now().plus({ minutes: 24 * 60 }).toISO();
    const otpData = {
      code,
      otpLen: 4,
      phoneNumber,
      expiry,
    };
    await OTP.doc(phoneNumber).set(otpData);
    return otpData;
  } catch (error) {
    console.log(error.message);
  }
};

const verifyCode = async (phoneNumber, code, keep) => {
  const docRef = OTP.doc(phoneNumber);
  const docSnapshot = await docRef.get();

  if (!docSnapshot.exists) {
    return false;
  }

  const otpData = docSnapshot.data();

  if (otpData.code !== code) {
    return false;
  }

  const expiryDateTime = DateTime.fromISO(otpData.expiry);

  if (expiryDateTime < DateTime.now()) {
    await docRef.delete();
    return false;
  }
  if (!keep) {
    await docRef.delete();
  }


  return true;
};

// const sendMessage = async (sms, port = 1) => {
//   const res = await axios.post(
//     `${process.env.SMS_URL}&recipients=${sms.to}&port=${sms.to.match(/25675|25670|25674|256200/) ? 8 : 1}&sms=${sms.message}`
//   );
//   return res.data
// }

const sendSMS = async (options) => {
  try {
    const resp = await sms.send(options);
    console.log(resp);
  } catch (error) {
    console.log('====', error.message)
    throw Error('Unable to process your request')
  }
};


module.exports = { sendSMS, generateOtp, verifyCode };
