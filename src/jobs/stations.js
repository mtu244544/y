const fs = require("fs");
const db = require("../firebase/config");
const stationsRef = db.collection("stations");
const stations = require("./cache/stations.json");
const { getMerchantInfo } = require("../payments/api");
const ApiError = require("../utils/ApiError");
// const { getUSSD } = require("../payments/getMerchant");

exports.updateStations = async () => {
  try {
    const snapshot = await stationsRef.get();
    const stationsDataArray = snapshot.docs.reduce((accumulator, doc) => {
      const data = doc.data();
      accumulator.push({ id: doc.id, ...data });
      return accumulator;
    }, []);

    fs.writeFileSync("./src/jobs/cache/stations.json", JSON.stringify(stationsDataArray, null, 2));
  } catch (error) {
    console.error("Error updating JSON file:", error);
  }
};

exports.getStationByMerchantId = async (payload) => {
  const merchantId = String(payload.merchantId);
  try {
    const station = await stationsRef.doc(merchantId).get()
    const data = station.data();
    if (data?.momoPayId) return data?.name || data?.momoPayId;
    const merchantName = await getMerchantInfo(payload)
    if (merchantName) {
      await stationsRef.doc(merchantId).set({ momoPayId: merchantId, name: merchantName, createdAt: Date.now() });
      return merchantName;
    }
    throw new ApiError(400, "Station not supported by our system");
  } catch (error) {
    throw error;
  }
};
