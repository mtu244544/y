const express = require("express");
const { createSession } = require("./ussd.controller");
const { checkRegistrationStatus, mergeCodeToRequestBody, getMerchantInfo } = require("./ussd.midlware");
const { validateGetFuel, validateBorrowing } = require("../utils/validator");
const { getRequestType, ussdType } = require("../utils");

const router = express.Router();

router.post("/", (req, res, next) => {
  try {
    res.setHeader("Content-Type", "text/plain");
    const type = getRequestType(req.body.text);
    const transType = type === ussdType.BORROW_FUEL || type === ussdType.GET_FUEL;
    if (transType) {
      if (type === ussdType.BORROW_FUEL) {
        return mergeCodeToRequestBody(req, res, () => {
          validateBorrowing(req, res, () => {
            getMerchantInfo(req, res, () => {
              createSession(req, res, next);
            });
          });
        });
      }
      return mergeCodeToRequestBody(req, res, () => {
        validateGetFuel(req, res, () => {
          getMerchantInfo(req, res, () => {
            createSession(req, res, next);
          });
        });
      });
    } else {
      checkRegistrationStatus(req, res, () => {
        createSession(req, res, next);
      });
    }
  } catch (error) {
    console.log("errrrrr", error.message);
  }
});

module.exports = router;
