const { ugx } = require(".");

function validate(object, data, charge, cb) {
  const errorMessages = Object.entries(data).map(([key, value]) => {
    const objValue = object[key] || "";
    const stringValue = typeof objValue !== "string" ? objValue.toString() : objValue;

    if (value.req && (!object[key] || !stringValue)) {
      return `${key} is required`;
    }

    if (value.alpha && objValue && !stringValue.match(/^[a-zA-Z]+$/)) {
      return `${key} should be alphabetic`;
    }

    if (value.bool && objValue && !stringValue.match(/^(true|false)$/)) {
      return `${key} should be either true or false`;
    }

    if (value.alphaNum && objValue && !stringValue.match(/^[a-zA-Z0-9]*$/)) {
      return `${key} should be alphanumeric`;
    }

    if (value.num && objValue && !stringValue.match(/^[0-9]+$/)) {
      return `${key} should be an integer`;
    }

    if (value.min && objValue && parseFloat(stringValue) < value.min) {
      return `${key} should be greater than ${value.min}`;
    }

    if (value.max && objValue && parseFloat(stringValue) > value.max) {
      if (value.max < ugx(charge)) {
        return `You have insufficient Balance try Borrow option`;
      }
      return `${key} should be UGX ${ugx(value.max)} or less since charge is UGX ${ugx(charge)}`;
    }

    if (value.minLength && objValue && stringValue.length < value.minLength) {
      return `${key} should be either 6 OR 7 characters`;
    }

    if (value.maxLength && objValue && stringValue.length > value.maxLength) {
      return `${key} should be either 6 OR 7 characters`;
    }

    if (value.ineligible) {
      return `You don't qualify to get Reserve Fuel`;
    }

    if (
      value.email &&
      objValue &&
      !stringValue.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    ) {
      return `Invalid ${key}`;
    }

    if (value.phoneNumber && objValue && !stringValue.match(/^\+256(?:78|77|76|75|74|70|20|39)\d{7}$/)) {
      return `Invalid ${key}`;
    }

    if (value.confirm && objValue && !value.confirm.match(stringValue)) {
      return `${key} provided do not match`;
    }

    return null;
  });

  const filteredErrors = errorMessages.filter((message) => message !== null);

  if (filteredErrors.length > 0) {
    return cb(filteredErrors.join(", "));
  }

  // No errors, proceed to the next middleware
  cb();
}

module.exports = validate;
