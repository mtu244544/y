const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const db = require("../firebase/config");
const { groupBy } = require("lodash");
const User = db.collection("users");
const { getComputedPayDay } = require("../payments/utils");
const { getSettings } = require("../settings");

const createUserAccount = async (userBody) => {
  const { accountType } = userBody;
  const config = await getSettings();

  const user = await User.doc(userBody.phoneNumber).set({
    ...userBody,
    limit: config.limits[accountType].amount || 0,
    dailyLimit: config.limits[accountType].dailyLimit,
    dueDate: getComputedPayDay(userBody.payDay),
    balance: 0,
    verified: true,
    paid: false,
    createdAt: Date.now(),
  });
  return user;
};

const updatePin = async (phoneNumber, password) => {
  const user = await getUserByPhoneNumber(phoneNumber, password);
  if (user) {
    user.password = password;
    await user.save();
    return user;
  }
};

const getAllUsers = async () => {
  try {
    const snapshot = await User.get();
    return snapshot.docs.map((o) => o.data())
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

const queryUsers = async (user, filter) => {
  try {
    // TODO: Implement pagination
    const pageSize = filter.pageSize || 100; // Adjust the page size as needed
    const page = filter.page || 1; // Specify the desired page

    // TODO: Add a query to get only users with dueDate
    let query = User.where('verified', '==', true);
    // query = query.orderBy("createdAt", "desc");
    if (filter && filter.dueDate) {
      query = query.where("balance", "<", 0);
    } else if (filter && filter.pastDueDate) {
      query = query.where("dueDate", "<", Date.now());
      query = query.where("balance", "<", 0);
    } else {
      query = query.orderBy("createdAt", "desc");
    }

    // Implement pagination
    const startIndex = (page - 1) * pageSize;
    query = query.limit(pageSize).offset(startIndex);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }

    const data = snapshot.docs.map((ln) => ({ id: ln.id, ...ln.data() }));

    const groupedData = groupBy(data, (item) => {
      const isoDate = new Date(item.createdAt).toISOString();
      return isoDate.split("T")[0];
    });

    return groupedData;
  } catch (error) {
    console.log("=====", error.message);
    throw error;
  }
};

const verifyUserKyc = async (phoneNumber,status) => {
  return (await User.doc(phoneNumber).update({
    'support_doc.status': status || 'VERIFIED'
  }))
}
const getUserByPhoneNumber = async (phoneNumber) => {
  return (await User.doc(phoneNumber).get()).data();
};

const getUserTransaction = async (phoneNumber) => {
  return (await Transactions.doc(phoneNumber).get()).data();
};

const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (updateBody.phoneNumber && (await User.isPhoneNumberTaken(updateBody.phoneNumber, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Phone Number already taken");
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (phoneNumber) => {
  const delUser = await User.doc(phoneNumber).delete();
  return delUser;
};

const verifyUser = async (phoneNumber, pin) => {
  const user = User.doc(phoneNumber).update({ pin, verified: true });
  return user;
};

const updateUser = async (phoneNumber, payload) => {
  try {
    await User.doc(phoneNumber).update(payload);
    return true;
  } catch (error) {
    throw error;
  }
};

async function getNegativeUsersBalances() {
  try {
    const usersCollection = await User.get();

    let totalNegativeBalance = 0;

    usersCollection.forEach((userDoc) => {
      const userData = userDoc.data();
      const balance = userData.balance || 0;
      if (balance < 0) {
        totalNegativeBalance += balance;
      }
    });
    return totalNegativeBalance;
  } catch (error) {
    console.error('Error fetching user balances:', error);
  }
}

async function getTotalAccountBalance() {
  try {
    const usersCollection = await User.get();
    let totalAccountBalance = 0;
    usersCollection.forEach((userDoc) => {
      const userData = userDoc.data();
      const balance = userData.limit || 0; // Default to 0 if balance is not present
      totalAccountBalance += balance;
    });

    return totalAccountBalance;
  } catch (error) {
    console.error('Error fetching user balances:', error);
  }
}


module.exports = {
  createUserAccount,
  getNegativeUsersBalances,
  getTotalAccountBalance,
  queryUsers,
  getUserByPhoneNumber,
  updateUserById,
  deleteUserById,
  verifyUser,
  updatePin,
  updateUser,
  getAllUsers,
  verifyUserKyc,
};
