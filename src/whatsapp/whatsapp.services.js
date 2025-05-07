const axios = require("axios");
const { sendSMS, generateOtp } = require("../sms/sms.service");
const { getRecentActivities } = require("./whatsapp.util");
const { createLoan } = require("../core/service");

const accessToken = process.env.ACCESS_TOKEN;
const apiVersion = process.env.VERSION;
const recipientNumber = "256758307272";
const myNumberId = process.env.PHONE_NUMBER_ID;

const getCredit = async ({ config, user, message }) => {
  // [KEY, AMOUNT, CONFIRM ]
  // req.body.context.from
  // {
  //   context: {
  //     from: '15550135210',
  //     id: 'wamid.HBgMMjU2NzU4MzA3MjcyFQIAERgSQTg2NzRBMDNEQTQxMkI1QkRCAA=='
  //   },
  //   from: '256758307272',
  //   id: 'wamid.HBgMMjU2NzU4MzA3MjcyFQIAEhgUM0ExNURCRDk0MEJBNUNENjNBREUA',
  //   timestamp: '1684940678',
  //   type: 'interactive',
  //   interactive: {
  //     type: 'button_reply',
  //     button_reply: { id: 'ACCOUNT', title: 'My Account' }
  //   }
  // }
  // try {

  if (message.interactive.button_reply.id === "CONFIRM_CREDIT") {
    const res = generateOtp(user.phoneNumber);
    createLoan({ phoneNumber: user.phoneNumber, amount: parseInt(getRecentActivities()[1]?.text.body), verificationCode: res?.code });
    const msg = `Credit request created for UGX ${parseInt(getRecentActivities()[1]?.text.body)}. Secret Code: ${res?.code}. expire in ${res?.expiry} Minutes`;
    sendTextMessage({
      type: "interactive",
      interactive: {
        type: "button",
        // header: {
        //   type: "text",
        //   text: "Welcome to Yo Advance Energies",
        // },
        body: {
          text: `Operation Successful !!`,
        },
        footer: {
          text: "Check your phone for verification message",
        },
        action: {
          buttons: [
            {
              text: "text",
              payload: "cta_action_123",
            },
            // {
            //   type: "call_to_action",
            //   reply: {
            //     id: "DONE",
            //     title: "Done",
            //   },
            // }
          ],
        },
      },
      // }
      // {
      //   type: "text",
      //   text: {
      //     body: "*Operation Successful !!*\n```Check your phone for verification message```",
      //   },
    });
    sendSMS({ to: user.phoneNumber, message: msg });
  }

  //  STEP 1
  if (message.interactive.button_reply.id === "GET_CREDIT") {
    return !user.limit
      ? `END Pay your outstanding credit before you request for new Credit`
      : sendTextMessage({
          type: "text",
          text: {
            body: `*How much Fuel do you need ?*\n Enter amount between(${config.baseAmount.toLocaleString()} to ${user.limit.toLocaleString()}) UGX`,
          },
        });
    //  sendTextMessage({
    //   header: {
    //     type: "text",
    //     text: ""type": "text"",
    //   },
    //   body: {
    //     text: "How much Fuel do you need",
    //   },
    //   footer: {
    //     text: `Enter amount between(${config.baseAmount.toLocaleString()} to ${user.limit.toLocaleString()}) UGX`,
    //   },
    // });
  }

  // STEP 2
  // if (AMOUNT && (AMOUNT < config.baseAmount || AMOUNT > user.limit)) {
  //   if (user.limit < config.baseAmount) {
  //     return `END You have exceeded your loan limit please repay`
  //   }
  //   return `END Invalid enter amount between (${config.baseAmount.toLocaleString()} to ${user.limit.toLocaleString()}) UGX`;
  // }
  // if (query.length === 2) {
  //   return `CON You get ${(sText(body, 1) / config.pricePerLitre).toFixed(1)} Litre of Fuel for UGX ${sText(body, 1).toLocaleString()} Rate UGX ${config.pricePerLitre}/Litre\nEnter YOPIN to confirm`;
  // }

  // STEP 3
  //   if (CONFIRM) {
  //     if (CONFIRM === user.pin) {
  //       const res = generateOtp(body.phoneNumber);
  //       createLoan({ phoneNumber: body.phoneNumber, amount: sText(body, 1), verificationCode: res?.code });
  //       const msg = `Credit request created for UGX ${sText(body, 1)}. Secret Code: ${res?.code}. expire in ${res?.expiry} Minutes`
  //       sendSMS({ to: body.phoneNumber, message: msg })
  //       return `END ${msg}`;
  //     }
  //     return `END Invalid request`;
  //   }

  //   //  STEP 1
  //   if (KEY === "1") {
  //     return !user.limit
  //       ? `END Pay your outstanding credit before you request for new Credit`
  //       : `CON How much Fuel do you need ?\n Enter amount between(${config.baseAmount.toLocaleString()} to ${user.limit.toLocaleString()}) UGX`;
  //   }
  // } catch (error) {
  //   return `END Invalid request`;
  // }
  // return `END Invalid request`;
};

let messageObject = {
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to: `${recipientNumber}`,
};

const sendTextMessage = async (message) => {
  // messageObject.interactive = interactive
  try {
    await axios.post(
      `https://graph.facebook.com/${apiVersion}/${myNumberId}/messages`,
      {
        ...messageObject,
        ...message,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  } catch (error) {}
};

function sendListMessage(req) {
  axios.post(
    `https://graph.facebook.com/${apiVersion}/${myNumberId}/messages`,
    {
      ...messageObject,
      ...{
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "text",
            text: "Welcome to Yo Advance Energies",
          },
          body: {
            text: `Hello *${req.user?.name.split(" ")[0]}*`,
          },
          footer: {
            text: "Please select an option to continue.",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "GET_CREDIT",
                  title: "Get Fuel",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "REPAY",
                  title: "Repay Fuel",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "ACCOUNT",
                  title: "My Account",
                },
              },
            ],
          },
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

function sendReplyButton(reply) {
  buttonInteractiveObject.body.text = reply.list_reply.id + ". " + reply.list_reply.title + " (" + reply.list_reply.description + ")";
  messageObject.interactive = buttonInteractiveObject;

  axios.post(`https://graph.facebook.com/${apiVersion}/${myNumberId}/messages`, messageObject, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

const sendPricingConfirmation = ({ config, user, message }) => {
  // {
  //   context: {
  //     from: '15550135210',
  //     id: 'wamid.HBgMMjU2NzU4MzA3MjcyFQIAERgSRDEyNTY1NDlBMEFCQjI2QkEwAA=='
  //   },
  //   from: '256758307272',
  //   id: 'wamid.HBgMMjU2NzU4MzA3MjcyFQIAEhgWM0VCMDBGRkNDM0E0RDRGQjRGQjM1QgA=',
  //   timestamp: '1685119372',
  //   type: 'interactive',
  //   interactive: { type: 'button_reply', button_reply: [Object] }
  // }

  if (getRecentActivities()[1]?.interactive.button_reply.id === "GET_CREDIT" && !isNaN(getRecentActivities()[0].text.body)) {
    sendTextMessage({
      type: "interactive",
      interactive: {
        type: "button",
        // header: {
        //   type: "text",
        //   text: "Welcome to Yo Advance Energies",
        // },
        body: {
          text: `You get *${(parseInt(message.text.body) / config.pricePerLitre).toFixed(1)}* Litre For *UGX ${parseInt(message.text.body).toLocaleString()}*\nRate *UGX ${
            config.pricePerLitre
          }*/Litre`,
        },
        footer: {
          text: "Press Done and  Check your phone for verification message",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "CANCEL",
                title: "Cancel",
              },
            },
            {
              type: "reply",
              reply: {
                id: "CONFIRM_CREDIT",
                title: "Done",
              },
            },
          ],
        },
      },
    });
  }
  // {
  //   from: '256758307272',
  //   id: 'wamid.HBgMMjU2NzU4MzA3MjcyFQIAEhgUM0FFQ0Y5OTkwMDY1NzNGNTQxMzIA',
  //   timestamp: '1685218396',
  //   text: { body: '10000' },
  //   type: 'text'
  // },

  if (!isNaN(getRecentActivities()[0].text.body)) {
  }
};

const sendWelcomeMessage = async ({ user }) => {
  await sendTextMessage({
    type: "text",
    text: {
      body: `Hi *${user.name?.split(" ")[0]}*\nWelcome To Yo Advance Energies\n How can we hep you?`,
    },
  });
};

const sendInvalidMessage = async ({ user }) => {
  await sendTextMessage({
    type: "text",
    text: {
      body: `Invalid response`,
    },
  });
};

const markAsRead = async (message_id) => {
  try {
    await axios.post(
      `https://graph.facebook.com/${apiVersion}/${myNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        status: "read",
        message_id: message_id,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  } catch (error) {}
};

module.exports = {
  sendReplyButton,
  sendListMessage,
  sendTextMessage,
  getCredit,
  sendPricingConfirmation,
  sendWelcomeMessage,
  markAsRead,
  sendInvalidMessage,
};
