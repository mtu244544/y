const { DateTime } = require("luxon");
const { ugx } = require("../utils");
const db = require("../firebase/config");
const { sendSMS, sendGsms } = require("../sms/sms.service");
const { log } = require("firebase-functions/logger");

const getMessage = ({ dueDate, name, balance }) => {
  const dt = DateTime.fromMillis(dueDate);
  const { days } = dt.diff(DateTime.now(), "days").toObject();
  const fDate = Math.abs(Math.round(days));
  const daysCount = Number(Math.round(days));
  const message = () => {
    const validDays = [2, 3, 4, 5];
    switch (true) {
      case validDays.includes(daysCount):
        return `is due in ${fDate} days. Dial *284*89*3# to pay in time and to get more fuel Thanks`;
      case daysCount === 1:
        return `is due tomorrow. Dial *284*89*3# to pay in time and to get more fuel Thanks`;
      case daysCount === 0:
        return `is due today. Dial *284*89*3# to pay in time and to get more fuel Thanks`;
      case daysCount === -1:
        return `was due yesterday. Dial *284*89*3# to pay. Kindly address this promptly to avoid inconveniences.`;
      case daysCount <= -2:
        return `was due ${fDate} days ago. Dial *284*89*3# to pay. Kindly address this promptly to avoid inconveniences.`;
      default:
        return "";
    }
  };
  return `Dear ${name.split(" ")[1]}\nYour payment of UGX ${ugx(Math.abs(balance))} ${message()} `;
};

exports.sendReminder = async () => {
  const usersRef = db.collection("users");
  const querySnapshot = await usersRef
    .where("dueDate", "<=", DateTime.now().plus({ days: 5 }).toMillis()).get();
  querySnapshot.docs.filter((doc) => {
    const data = doc.data();
    if (data?.balance < 0) {  
      const message = getMessage(data);
      if (data) {
        sendSMS({
          to: data.phoneNumber,
          message,
        });
        return data;
      }
    }

  });
};
