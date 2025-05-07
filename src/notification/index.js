const { sendSMS } = require("../sms/sms.service")
const { getAllUsers } = require("../users/user.service")


const appUpdates = async () => {
    const message = `Yobo App Update! 🌟 Check out the latest features and improvements. Update now on the App Store or Google Play for an even better experience. Thank you!`
    const users = await getAllUsers()
    sendSMS({ to: users.map((e) => e.phoneNumber), message })
}

const systemOffline = async () => {
    const message = `Attention: Our system is temporarily offline for maintenance. We apologize for any inconvenience and appreciate your understanding. We'll notify you once it's back up. Thank you. 🙏`
    const users = await getAllUsers()
    sendSMS({ to: users.map((e) => e.phoneNumber), message })
}

const systemBackOnline = async () => {
    const message = `🚀 Good news! Our system is back online. You can now resume normal operations. Thanks for your patience and understanding.`
    const users = await getAllUsers()
    sendSMS({ to: users.map((e) => e.phoneNumber), message })
}

const defaultersMessage = () => {
    const message = ` Hi ,
Your fuel repayment is overdue. Act now to avoid:
1. Credit score impact
2. Account deactivation
3. Legal action
Contact your Account Manager to discuss and resolve. Thank you. `
}

const sendSMSNotification = (req, res) => {
    switch (req.params.type) {
        case 'APP_UPDATES':
            appUpdates()
            return res.status(200).send({ status: 200, message: 'done' })
        case 'SYS_OFFLINE':
            systemOffline()
            return res.status(200).send({ status: 200, message: 'done' })
        case 'SYS_ONLINE':
            systemBackOnline()
            return res.status(200).send({ status: 200, message: 'done' })
        default:
            break;
    }

}

module.exports = { sendSMSNotification }