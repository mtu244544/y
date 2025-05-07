const db = require("../firebase/config");
const { DateTime } = require("luxon");
const { getUserByPhoneNumber } = require("../users/user.service");

const debtRef = db.collection("debts");

const Service = {
  createDebt: async (data) => {
    return debtRef.add({
      ...data,
      createdAt: new Date().toISOString(),
      approved: true,
      paid: false,
    });
  },
  getUserDebts: async (phoneNumber, payload) => {
    let query = debtRef.where("phoneNumber", "==", phoneNumber);
    query = query.orderBy("createdAt", "desc");
    query = query.where("approved", "==", true);
    query = query.limit(10);
    if (Object.keys(payload).includes("paid")) {
      query = query.where("paid", "==", JSON.parse(payload.paid));
    }
    const snapshot = await query.get();
    if (snapshot.empty) {
      return [];
    }
    const data = snapshot.docs.map((ln) => ({ id: ln.id, ...ln.data() }));
    const groupedData = groupBy(data, (item) => item.createdAt?.split("T")[0]);
    return Object.keys(payload).includes("groupByDate") ? groupedData : data;
  },
};

module.exports = Service;
