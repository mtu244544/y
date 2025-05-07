const { getUserByPhoneNumber, verifyUser } = require("../users/user.service");
const { sText, getRequestType, ussdType, isFuelStation } = require("../utils");
const { getStationByMerchantId } = require("../jobs/stations");
const { pricingFlow } = require("./flows/pricingFlow");
const { getSettings } = require("../settings");

const checkRegistrationStatus = async (req, res, next) => {
  try {
    // TODO: Create a cache for settings (Implement getRequestType and other functions)

    req.type = getRequestType(req.body.text);

    const user = await getUserByPhoneNumber(req.body?.phoneNumber);

    if (user && !user.verified) {
      if (req.body.text?.match(/^\d{4}$/)) {
        return res.status(200).send(`CON Enter YOBO Pin again to confirm`);
      }

      // Fix the regular expression issue
      if (req.body.text?.match(/\*/) && req.body.text.split("*").length === 2) {
        if (req.body.text.split("*")[0] === req.body.text.split("*")[1]) {
          await verifyUser(req.body?.phoneNumber, req.body.text.split("*")[0]);
          pricingFlow(req.body)
          return res.status(200).send(`END Congratulations! Registration Complete`);
        }
        return res.status(200).send(`CON Invalid YOBO Pin Confirmation`);
      }

      return res.status(200).send(`CON Complete Registration\nEnter 4 digits YOBO Pin of your Choice?`);
    }

    if (!user) {
      return res.status(200).send(`END Welcome To Yobo App\nPlease complete the registration process with our Agents?`);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).send(`END An error occurred. Please try again later.`);
  }
};

const mergeCodeToRequestBody = async (req, res, next) => {
  try {
    if (!/^([0-9#*]*)$/.test(req.body.text)) {
      return res.status(400).send({ status: 400, error: "invalid Input provided" });
    }
    req.type = getRequestType(req.body.text);
    const user = await getUserByPhoneNumber(req.body?.phoneNumber || "+" + req.message?.from);
    if (!user) return res.status(401).send(`END Welcome To Yobo App\nPlease complete registration Process with our Agents?`);
    req.config = await getSettings();
    req.user = user;
    if (req.type === ussdType.GET_FUEL || req.type === ussdType.BORROW_FUEL) {
      const data = {
        ...req.body,
        amount: sText(req.body, 1),
        merchantId: req.body.text?.split("*")[2],
        pin: sText(req.body, 3).toString(),
      };
      req.body = Object.keys(data).reduce((result, key) => {
        if (data[key]) {
          result[key] = data[key];
        }
        return result;
      }, {});
    }
    
    return next();
  } catch (error) {
    console.log("error", error.message);
    //TODO: send sms to admin with details
    res.status(500).send(`END External USSD Application Down`);
  }
};

const getMerchantInfo = async (req, res, next) => {
  try {
    if (req.body.text.split("*").length >= 3) {
      if (!req.body.merchantId || !req.body.amount) {
        return res.status(400).send("END Missing merchantId or amount in the request.");
      }
      req.body.station = await getStationByMerchantId(req.body);
      next();
    } else {
      next();
    }
  } catch (error) {
    // Handle unexpected errors
    console.error("Error in getMerchantInfo:", error.message);
    return res.status(500).send("END Oops! Station not supported by our System.");
  }
};

module.exports = {
  checkRegistrationStatus,
  checkRegistrationStatus,
  mergeCodeToRequestBody,
  getMerchantInfo,
};
