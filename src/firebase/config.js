const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRESTORE,
  apiKey: "AAAAoG6P6y4:APA91bEDMFe5xk0C99FMRHDO616u_cbVBkZ6at9_NwtFHNPfVSlIyINQzXT_WapATSooWxho28-AF_pKzjBRojxGrWDhHIJ7SzvUgVLKUn3BOE6B009CQn4I17KCfHMFP1I6JkJEKQQo",
  ignoreUndefinedProperties: true,
});



module.exports = admin.firestore();
