const admin = require("firebase-admin");

exports.sendPushNotification = async (token, msg = message) => {
    try {
        msg.token = token
        msg.android ={
            priority: 'high'
        }
        await admin.messaging().send(msg)
        console.log('Successfully sent message:');
    } catch (error) {
        console.log('Error sending message:', error.message);
    }
}

