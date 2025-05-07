const { default: axios } = require("axios");
const { extractData } = require("./utils");
const { isFuelStation } = require("../utils");
const { updateSettings, getSettings } = require("../settings");
const { sendSMS } = require("../sms/sms.service");

const getRes = async (ussd, port) => {
  const {NODE_ENV,DEV_DEVICE_URL,PROD_DEVICE_URL} = process.env;
    const deviceUrl = PROD_DEVICE_URL
    const { data, config } = await axios.post(
        `${deviceUrl}&port=${port}&ussd=${ussd}`
    );
  console.log('body', data, config.url);
  return data
}

exports.getYakaDetails = async (req, res) => {
  try {
    if (!req.params.meter) return res.status(400).send({ error: 'meter number not provided' })
    const data = await getRes(`*185*4*1*1*2*${req.params.meter}%23`, 1);
    const nameRegex = /A\/C No: (\d+)/;
    const amountDueRegex = /Amount Due: (\d+)/;
    const accountNameRegex = /A\/C Name: (\S+\s+\S+)/;
    const accountNameMatch = data.resp.match(accountNameRegex);
    const nameMatch = data.resp.match(nameRegex);
    const amountDueMatch = data.resp.match(amountDueRegex);
    const accountName = accountNameMatch ? accountNameMatch[1] : null;
    const name = nameMatch ? nameMatch[1] : null;
    const amountDue = amountDueMatch ? amountDueMatch[1] : null;
    return res.status(200).send({
      status: 200,
      data: {
        name,
        accountName: accountName?.replace('  ', ''),
        amountDue,
      }
    });
  } catch (error) {

  } finally {
    getRes(`*185%23`, 1);
  }
  console.log('=======');
}

const getBalance = async (text) => {
  const balPattern = /balance is UGX (\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\./;
  const balMatch = text.match(balPattern);
  if (balMatch) {
    await updateSettings({ totalFloat: parseFloat(balMatch[1].replace(',', '')) })
  }
}

exports.getMerchantInfo = async (req) => {
  try {
    const data = await getRes(`*185*3*${req.merchantId}*${1000}*1*%23`, 2);
    const regex = /to (.+?)\. Reason/;
    const match = data.resp.match(regex);
    if (match && match[1]) {
      if (isFuelStation(match[1])) {
        return match[1];
      }
      return "";
    } else {
      return "";
    }
  } catch (error) {

  } finally {
    // getRes(`*185%23`, 1);
  }
};

exports.payNow = async (req) => {
  try {
    const settings = await getSettings()
    if (Number(settings.totalFloat || 0) < Number(req.amount)) {
      // sendSMS({ to: '+256758307272', message: `System credit is low (UGX ${settings.systemBalance})` })
      console.log('System credit is low');
      return { error: 'System credit is low' }
    }
    let port = 1;
    let data = null;
    data = await getRes(`*185*3*${req.merchantId}*${req.amount}*1*25803%23`, port);
    const match = data.resp.match(/ID (\d+)/);
    getBalance(data.resp)
    if (match && match[1]) {
      const amountMatch = data.resp.match(/UGX ([\d,]+)/);
      return { transactionId: match[1], amount: amountMatch[1] };
    } else {
      return { error: data.resp }
    }
  } catch (error) {
    return { error: true }
  }
};

exports.repay = (req, res) => {
  try {
    const text = req.body.toString('utf-8');
    const sender = text.match(/^Sender: (.*?)$/m)[1]?.trim();
    const messageMatch = text.match(/(?<=Slot: "[\d]+")[\s\S]+/);
    const message = messageMatch && messageMatch[0].trim();
    if ((sender === "MTNMobMoney" || sender === "256758307272" || sender === "256770383841") && message.match('You have received')) {
      return extractData(message)
    }
    return res.status(200).send({ status: 200 });
  } catch (error) {
    console.log('repay:', error.message);
  }
}

exports.getSystemBalance = async (req) => {
  try {
    let port = 2;
    let data = null;
    data = await getRes(`*185*8*1*25803%23`, port);
    const balanceRegex = /UGX ([\d,]+)/;
    const match = data.resp.match(balanceRegex);
    if (match) {
      const accountBalance = match[1].replace(/,/g, '');
      return Number(accountBalance);
    } else {
      return 0
    }
  } catch (error) {
    return 0
  }
};

exports.getSystemReserve = async (req) => {
  try {
    let port = 1;
    let data = null;
    data = await getRes(`*185*8*1*25803%23`, port);
    const balanceRegex = /UGX ([\d,]+)/;
    const match = data.resp.match(balanceRegex);
    if (match) {
      const accountBalance = match[1].replace(/,/g, '');
      return Number(accountBalance);
    } else {
      return 0
    }
  } catch (error) {
    return 0
  }
};


exports.validatePhone = async(msisdn) => {
  console.log('==ddd==', msisdn)
  try {
    const apiKey = 'a6d10c136873fd.e0jfX4fshl9u_YyDvkiiXA'; 
    const response = await axios.post(
      'https://payments.relworx.com/api/mobile-money/validate', 
      { msisdn }, 
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.relworx.v2',
          'Authorization': `Bearer ${apiKey}` 
        }
      }
    );
    return response.data; 
  } catch (error) {
    console.log('===', error.message)
    throw Error(error);
  }
};

exports.mobileMoneyPayment = async({msisdn,amount}) => {
  try {
    const apiKey = 'a6d10c136873fd.e0jfX4fshl9u_YyDvkiiXA'; 
    const reference = generateRandomToken();
    const response = await axios.post(
      'https://payments.relworx.com/api/mobile-money/request-payment', 
      {
        "account_no": "REL30D14C8768",
        "reference": reference,
        "msisdn": msisdn,
        "currency": "UGX",
        "amount": amount,
        "description": "Payment Request."
    }, 
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.relworx.v2',
          'Authorization': `Bearer ${apiKey}` 
        }
      }
    );
    return response.data; 
  } catch (error) {
    console.log('====', error.response.data.message)
    throw new Error(error.response.data.message);
  }
};

function generateRandomToken(length = 32) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}