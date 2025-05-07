const XHubSignature = require('x-hub-signature');
const { sendListMessage, getCredit, sendPricingConfirmation, sendWelcomeMessage, markAsRead, sendInvalidMessage } = require("./whatsapp.services");
const { json } = require('body-parser');
const { addActivity, getRecentActivities } = require('./whatsapp.util');

const xhub = new XHubSignature('SHA256', process.env.APP_SECRET);

exports.getWhatsappHook = (req, res) => {
  if (
    req.query['hub.mode'] == 'subscribe' &&
    req.query['hub.verify_token'] == process.env.VERIFY_TOKEN
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
}

exports.getIncomingMessage = async (req, res) => {
  try {
    await markAsRead(req.message.id)

    // Calculate x-hub signature value to check with value in request header

    // const message = req.body?.entry[0]?.changes[0]?.value.messages[0];
    const messageType = req.message?.type;
    // const calcXHubSignature = xhub.sign(req.rawBody).toLowerCase();

    // if (req.headers['x-hub-signature-256'] != calcXHubSignature) {
    //   res.sendStatus(401);
    //   return;
    // }


    // const message = req.body.entry[0].changes[0].value.messages[0];
    // const messageType = message.type;
    addActivity(req.message)
    if (messageType === "interactive") {
      getCredit(req);
    } else if (messageType === "text") {
      // validate if user is entering Amount
      if (!isNaN(req.message.text.body)) {
        sendPricingConfirmation(req);
      }
      if (isNaN(req.message.text.body) && req.message.text.body.match(/(fuel|petrol|diesel)/gi)) {
        sendListMessage(req);
      }
      if (isNaN(req.message.text.body) && !req.message.text.body.match(/(fuel|petrol|diesel)/gi)) {
        sendWelcomeMessage(req);
      }
    }
    return res.sendStatus(200);
  } catch (error) {
    sendInvalidMessage(req);
  }
}