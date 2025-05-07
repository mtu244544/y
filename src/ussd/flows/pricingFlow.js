const { sendSMS } = require("../../sms/sms.service");

exports.pricingFlow = (req) => {
    sendSMS({
        to: req.phoneNumber,
        message: `
On Balance Charge is Free 
On Reserve Charges in (UGX):
2,000 - 5,000 = 800
5,001 - 10,000 = 1,700
10,001 - 15,000 = 2,150
15,001 - 20,000 = 2,800
20,001 - 25,000 = 3,250
25,001 - 30,000 = 3,700
30,001 - 50,000 = 5,500
50,001 - 80,000 = 8,700
80,001 - 100,000 = 12,000
100,001 - 150,000 = 17,000
150,001 - 200,000 = 21,000
200,001 - 250,000 = 31,000
250,001 - 300,000 = 45,000
300,001 - 500,000 = 56,000
`
    })
    return `END Pricing list sent to your phone. You will receive a pricing SMS shortly.`;
};
