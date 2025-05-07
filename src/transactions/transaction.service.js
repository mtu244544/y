// const Loan = require("./loan.model");
const { async } = require("validate.js");
const db = require("../firebase/config");
const firebase = require("firebase-admin");
const { groupBy } = require("lodash");
const { DateTime } = require("luxon");
const oneMinuteAgo = DateTime.now().minus({ minutes: 1 }).toMillis();

const Transaction = db.collection("transactions");
const sms = db.collection("sms");

const createTransaction = async (data) => {
  const query = data.internal_reference ? await Transaction.doc(data.internal_reference).set(data) : await Transaction.add(data);
  const { id } = await query;
  return { id };
};

const updateTransactionById = async (transactionId, newData) => {
  const transactionRef = Transaction.doc(transactionId);
  try {
    await transactionRef.update(newData);
  } catch (error) {
    // console.error("Error updating transaction:", error);
  }
};

const updateTransactionByInternalRef = async (refId, newData) => {
  const transactionRef = Transaction.doc(refId);
  try {
    await transactionRef.update(newData);
  } catch (error) {
    // console.error("Error updating transaction:", error);
  }
};

const getTransactions = async () => {
  const snapShot = await Transaction.get();
  const lists = snapShot.docs.map((list) => ({
    id: list.id,
    ...list.data(),
  }));
  if (snapShot.empty) {
    return [];
  } else {
    return lists;
  }
};

const getSingleTransaction = async (transactionId) => {
  const query = Transaction.where("transactionId", "==", transactionId);
  const transaction = await query.get();
  return transaction.docs[0]?.data();
};

const getTransactionById = async (transactionId) => {
  const query = Transaction.doc(transactionId);
  const transaction = await query.get();
  return transaction.data();
};

const getTransactionByPhoneNumber = async (phoneNumber) => {
  const query = Transaction.where("phoneNumber", "==", phoneNumber);
  const transaction = await query.get();
  return transaction.docs[0]?.data();
};

const removeTransaction = async (id) => {
  await Transaction.doc(id).delete();
  return "Transaction deleted successfully";
};

const userTransactions = async (payload) => {
  let query = Transaction.where("phoneNumber", "==", payload.phoneNumber).where("status", "==", 'COMPLETE');
  query = query.limit(payload.limit ? parseInt(payload.limit) : 40);
  const snapshot = await query.get();
  if (snapshot.empty) {
    return [];
  }
  const data = snapshot.docs.map((ln) => ({ id: ln.id, ...ln.data() }));
  const groupedData = groupBy(data, (item) => new Date(item.createdAt).toISOString()?.split("T")[0]);
  return Object.keys(payload).includes("groupByDate") ? groupedData : data;
};

const getTransactionsByPhoneNumber = async (payload) => {
  let query = Transaction.where("phoneNumber", "==", payload.msisdn);
  query = query.orderBy("createdAt", "desc");
  query = query.limit(payload.limit ? parseInt(payload.limit) : 100);
  const snapshot = await query.get();
  if (snapshot.empty) {
    return [];
  }
  const data = snapshot.docs.map((ln) => ({ id: ln.id, ...ln.data() }));
  const groupedData = groupBy(data, (item) => {
    const isoDate = new Date(item.createdAt).toISOString();
    return isoDate.split("T")[0];
  });
  return Object.keys(payload).includes("groupByDate") ? groupedData : groupedData;
};

const getTransactionStatus = ({ id, station, amount, phoneNumber }) => {
  return new Promise((resolve, reject) => {
    let timeoutId;

    // Set a timeout of 30 seconds
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Timeout exceeded"));
      }, 60000); // 30 seconds in milliseconds
    });

    sms.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        if (change.type === "added" && !data.complete && oneMinuteAgo < data.createdAt && amount == data.amount && !data.transactionId) {
          return reject("failed");
        }
        if (change.type === "added" && !data.complete && oneMinuteAgo < data.createdAt && amount == data.amount && !!data.station.match(station)) {
          sms.doc(data.transactionId).update({ phoneNumber, complete: true });
          Transaction.doc(id).update({ status: "COMPLETE" });
          clearTimeout(timeoutId); // Clear the timeout since we have a result
          resolve(data);
        }
      });
    });

    Promise.race([timeoutPromise, new Promise(() => { })]).catch((error) => {
      // Handle the error here or propagate it further if needed
      reject(error);
    });
  });
};

module.exports = {
  createTransaction,
  updateTransactionByInternalRef,
  getTransactions,
  getSingleTransaction,
  removeTransaction,
  userTransactions,
  getTransactionsByPhoneNumber,
  getTransactionByPhoneNumber,
  getTransactionStatus,
  updateTransactionById,
  getTransactionById,
};
