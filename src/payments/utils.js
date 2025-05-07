const { sendSMS } = require("../sms/sms.service");
const { getSingleTransaction, createTransaction, getTransactionsByPhoneNumber, getTransactionById, updateTransactionByInternalRef } = require("../transactions/transaction.service");
const { ugx } = require("../utils");
const { updateBalance, markAsPaidDebtComplete } = require("../wallet/wallet.service");
const { DateTime } = require("luxon");
const db = require("../firebase/config");
const { sendPushNotification } = require("../utils/sendPushNotifications");
const User = db.collection("users");

exports.extractData = (text) => {
    if (text.match("Reason:")) {
        const amountRegex = /UGX (\d+(?:,\d{3})*(?:\.\d{2})?) from/;
        const companyNumberRegex = /\b256\d+\b/g;
        const transactionIdRegex = /ID: (\d+)/;
        // Use regex to extract data
        const amountMatch = text.match(amountRegex);
        const phone = text.match(companyNumberRegex);
        const transId = text.match(transactionIdRegex);
        // Check if matches were found
        if (amountMatch && phone && transId) {
            const amount = Number(amountMatch[1].replace(/,/g, ''));
            const phoneNumber = `+${phone[1] ? phone[1] : phone[0]}`;
            const transactionId = transId[1];
            this.deposit({ amount, phoneNumber, transactionId })
        }
    }
    return null;
};
exports.getComputedPayDay = (payDay) => {
    const currentTimestamp = Date.now();
    const currentDate = new Date(currentTimestamp);
    currentDate.setDate(Number(payDay));
    if (currentDate.getTime() <= currentTimestamp) {
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    const today = DateTime.local();
    const fiveDaysLater = today.plus({ days: 5 });
    return currentDate.getTime() || fiveDaysLater.toMillis()
}

exports.deposit = async ({ phoneNumber, amount, transactionId }) => {
    if (phoneNumber) {
        try {
            const user = await (await User.doc(phoneNumber).get()).data();
            const transactionExists = await getSingleTransaction(transactionId);
            //TODO: CHECK IF THE DB has transaction
            if (transactionExists) return console.log("trans exists");;

            await createTransaction({
                phoneNumber,
                amount: Number(amount),
                transactionId,
                status: "COMPLETE",
                type: "DEPOSIT",
                createdAt: Date.now(),
            });
            if (user) {
                console.log("user found");
                //Balance is updated Here
                await updateBalance({
                    phoneNumber,
                    amount: Number(amount),
                    getFuel: true,
                    repay: true,
                });
                console.log("balance updated");
                const userBalance = Number(user.balance);
                const paymentAmount = Number(amount);
                let smsMessage = "";

                if (userBalance < 0) {
                    if (paymentAmount + userBalance >= 0) {
                        smsMessage = `Congratulations! You have settled all your pending UGX ${ugx(-userBalance)} debt your Bal is UGX ${ugx(paymentAmount + userBalance)}`;
                        await markAsPaidDebtComplete(phoneNumber);
                    } else if (paymentAmount + userBalance < 0) {
                        smsMessage = `Approved! Partial Payment of UGX ${ugx(paymentAmount)} complete. Bal UGX ${ugx(paymentAmount + userBalance)} due: ${user.dueDate ? DateTime.fromMillis(user.dueDate).toFormat("MMM d, yyyy HH:mm") : ""
                            }`;
                    }
                } else {
                    smsMessage = `Received!! UGX ${ugx(paymentAmount)} on your YOBO Account. Bal UGX ${ugx(paymentAmount + userBalance)}\nDate: ${DateTime.now().toFormat("MMM d, yyyy HH:mm")}`;
                }
                await sendSMS({
                    to: phoneNumber,
                    message: smsMessage,
                });
            } else {
                const transaction = await getTransactionsByPhoneNumber(transactionId);
                //TODO: check for any transaction related to this phone
                if (transaction) return console.log("user paid already");
                const paymentAmount = Number(amount);
                if (paymentAmount === 5000 || paymentAmount === 5000) {
                    await sendSMS({
                        to: phoneNumber,
                        message: `Account Creation Request!\nYour UGX ${ugx(paymentAmount)} payment has been received. Welcome to Yobo!\nDate: ${DateTime.now().toFormat("MMM d, yyyy HH:mm")}`,
                    });
                }
            }
        } catch (error) {
            console.log("Error==", error.message);
            throw error
        }
    }
    //TODO transactions
};

exports.depositApi = async ({ amount, infoMessage, transactionId, provider }) => {
    try {
        const transaction = await getTransactionById(transactionId);

        const user = await (await User.doc(transaction.phoneNumber).get()).data();

        await updateTransactionByInternalRef(
            transactionId,
            {
                status: "COMPLETE",
                provider,
                message: infoMessage
            }
        );
        if (user) {
            console.log("user found");
            //Balance is updated Here
            await updateBalance({
                phoneNumber: transaction.phoneNumber,
                amount: Number(amount),
                getFuel: true,
                repay: true,
            });
            console.log("balance updated");
            const userBalance = Number(user.balance);
            const paymentAmount = Number(amount);
            let smsMessage = "";

            if (userBalance < 0) {
                if (paymentAmount + userBalance >= 0) {
                    smsMessage = `Congratulations! You have settled all your pending UGX ${ugx(-userBalance)} debt your Bal is UGX ${ugx(paymentAmount + userBalance)}`;
                    await markAsPaidDebtComplete(transaction.phoneNumber);
                } else if (paymentAmount + userBalance < 0) {
                    smsMessage = `Approved! Partial Payment of UGX ${ugx(paymentAmount)} complete. Bal UGX ${ugx(paymentAmount + userBalance)} due: ${user.dueDate ? DateTime.fromMillis(user.dueDate).toFormat("MMM d, yyyy HH:mm") : ""
                        }`;
                }
            } else {
                smsMessage = `Received!! UGX ${ugx(paymentAmount)} on your YOBO Account. Bal UGX ${ugx(paymentAmount + userBalance)}\nDate: ${DateTime.now().toFormat("MMM d, yyyy HH:mm")}`;
            }
            sendPushNotification(user.fcmtoken, {
                notification: {
                    title: 'SUCCESS',
                    body: smsMessage,
                }, data: { status: 'COMPLETE', subtitle: 'Deposit', provider, transactionId },
            })
            await sendSMS({
                to: transaction.phoneNumber,
                message: smsMessage,
            });
        } else {
            const transaction = await getTransactionsByPhoneNumber(transactionId);
            //TODO: check for any transaction related to this phone
            if (transaction) return console.log("user paid already");
            const paymentAmount = Number(amount);
            if (paymentAmount === 5000 || paymentAmount === 5000) {
                await sendSMS({
                    to: phoneNumber,
                    message: `Account Creation Request!\nYour UGX ${ugx(paymentAmount)} payment has been received. Welcome to Yobo!\nDate: ${DateTime.now().toFormat("MMM d, yyyy HH:mm")}`,
                });
            }
        }
    } catch (error) {
        console.log("Error==", error.message);
    }
};

exports.depositFailed = async ({ internal_reference, message, provider }) => {
    console.log(internal_reference, message, provider)
    if (provider) {
        try {
            const transaction = await getTransactionById(internal_reference);
            if(!transaction?.phoneNumber) return null;
            const user = await (await User.doc(transaction.phoneNumber).get()).data();
            await updateTransactionByInternalRef(
                internal_reference,
                { status: 'FAILED', provider, message }
            );
            sendPushNotification(user.fcmtoken, {
                notification: {
                    title: 'Payment Failed!',
                    body: 'We are unable to process your payment at this time. Please try again.',
                }, data: { status: 'FAILED', subtitle: 'Deposit', provider, transactionId: internal_reference },
            })
        } catch (error) {
            console.log('depositFailed', error.message)
        }
    }
}
