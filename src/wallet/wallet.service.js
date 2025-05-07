const db = require("../firebase/config");
const User = db.collection("users");
const settings = db.collection("settings");
const { DateTime } = require("luxon");

const getDueDate = async ({ user, getFuel, repay }) => {
  if (!repay) {
    if (!getFuel && !user.dueDate) {
      if (!user.payDay) {
        const config = await settings.doc("settings");
        const q = await config.get();
        const { limits } = q.data();
        return DateTime.now()
          .plus({ days: Number(limits[user.accountType]?.duration || 30) })
          .toMillis();
      }
      const currentTimestamp = Date.now();
      const currentDate = new Date(currentTimestamp);
      currentDate.setDate(Number(user.payDay));
      if (currentDate.getTime() <= currentTimestamp) {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      return currentDate.getTime();
    }
  }
};

const updateBalance = async ({ phoneNumber, amount, getFuel, repay }) => {
  const userRef = User.doc(phoneNumber);
  const user = (await userRef.get()).data();
  const totalCharge = Math.abs(amount);
  const dueDate = await getDueDate({ user, repay });
  const payload = {
    balance: user.balance + parseInt(amount),
    limit: getFuel ? user.limit : Math.floor(user.limit + parseInt(amount)),
  };
  await userRef.update(dueDate ? { ...payload, dueDate } : payload);
  return { totalCharge, user };
};

const markAsPaidDebtComplete = async (phoneNumber) => {
  const userRef = User.doc(phoneNumber);
  const user = (await userRef.get()).data();
  const config = await settings.doc("settings");
  const q = await config.get();
  const { limits } = q.data();

  const currentTimestamp = Date.now();
  const currentDate = new Date(currentTimestamp);
  currentDate.setDate(Number(user.payDay));
  if (currentDate.getTime() <= currentTimestamp) {
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  const today = DateTime.local();
  const fiveDaysLater = today.plus({ days: 5 });
  await userRef.update({ dueDate: currentDate.getTime() || fiveDaysLater.toMillis(), limit: user.maxLimit || limits[user.accountType].amount });
};

module.exports = { updateBalance, markAsPaidDebtComplete };
