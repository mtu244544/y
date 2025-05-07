const db = require("../firebase/config");
const { DateTime } = require('luxon');

async function checkDailyWithdrawalLimit(user, withdrawalAmount) {
    const twentyFourHoursAgo = DateTime.now().minus({ hours: 24 }).toJSDate().getTime();
    const transactionRef = db.collection('transactions')
        .where('phoneNumber', '==', user.phoneNumber)
        .where('type', '==', 'BORROW_FUEL') // Assuming there's a 'type' field to distinguish withdrawals
        .where('status', '==', 'COMPLETE')
        .where('createdAt', '>=', twentyFourHoursAgo);
    const querySnapshot = await transactionRef.get();
    let totalWithdrawnLast24Hours = 0;
    querySnapshot.forEach((doc) => {
        totalWithdrawnLast24Hours += doc.data().amount;
    });
    // Check if the total withdrawal amount exceeds the daily limit
    if (totalWithdrawnLast24Hours + withdrawalAmount > (user.dailyLimit || 60000)) {
        return user.dailyLimit || 60000; // Daily limit exceeded
    } else {
        return false; // Withdrawal is within the limit
    }
}

module.exports = { checkDailyWithdrawalLimit }