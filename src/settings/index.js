const db = require("../firebase/config");

async function getSettings() {
  try {
    const settingRef = db.collection("settings").doc("settings");
    const settings = (await settingRef.get()).data();
    return settings;
  } catch (error) {
    console.log(`settings creation failed==.`, error.message);
  }
}

async function updateSettings(body) {
  try {
    await db.collection("settings").doc("settings").update(body);
    return true;
  } catch (err) {
    console.log("Failed to update settings", err);
    return false;
  }
}

async function pricing() {
  try {
    await db.collection("pricing").doc("pricing").set({
      700: "[2000,5000]",
      1200: "[5001,10000]",
      1700: "[10001,15000]",
      2200: "[15001,20000]",
      2700: "[20001,25000]",
      3200: "[25001,30000]",
      5200: "[30001,50000]",
      10200: "[50001,100000]",
      15200: "[100001,150000]",
      22000: "[150001,200000]",
      32000: "[200001,300000]",
      50200: "[300001,500000]",
    });
    return true;
  } catch (err) {
    console.log("Failed to update settings", err);
    return false;
  }
}

const getPricingList = async () => {
  const pricingDocRef = db.collection('pricing').doc('pricing');
  const pricingDocSnapshot = await pricingDocRef.get();
  if (pricingDocSnapshot.exists) {
    const pricingData = pricingDocSnapshot.data();
    return pricingData;
  } else {
    return null
  }
}

module.exports = { getSettings, updateSettings, getPricingList, pricing };

