const fs = require("fs");
const db = require("../firebase/config");
const path = require("path");
const settingsRef = db.collection("settings");

exports.updateSettings = async () => {
  try {
    const unsubscribe = settingsRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "modified") {
          const snapshot = await settingsRef.get();
          const settingsDataArray = snapshot.docs[0].data();
          fs.writeFileSync("./src/jobs/cache/settings.json", JSON.stringify(settingsDataArray, null, 2));
          // unsubscribe()
        }
      });
    });
  } catch (error) {
    console.error("Error updating JSON file:", error);
  }
};

// this.updateSettings()

// exports.update = async () => {
//   try {
//     const pricingRef = db.collection("settings");

//     await pricingRef.doc("settings").create({
//       lowBalanceAmount: 500000,
//       totalFloat: 100000,
//       baseAmount: 2000,
//       adminContact: "+256758307272",
//       limits: {
//         BUSINESS_PRIME: {
//           duration: 5,
//           amount: 100000,
//           increaseAmount: 20000,
//           maxLimit: 200000,
//         },
//         BUSINESS_BASIC: {
//           duration: 5,
//           maxLimit: 100000,
//           increaseAmount: 5000,
//           amount: 50000,
//         },
//         CORPORATE_PRIME: {
//           maxLimit: 1000000,
//           increaseAmount: 20000,
//           amount: 200000,
//         },
//         CORPORATE_BASIC: {
//           increaseAmount: 5000,
//           maxLimit: 200000,
//           amount: 100000,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error updating JSON file:", error);
//   }
// };

// this.update();
