const { default: axios } = require("axios");
const db = require("../firebase/config");
const Bills = db.collection("bills");

const getRes = async (ussd, port) => {
    const { NODE_ENV, DEV_DEVICE_URL, PROD_DEVICE_URL } = process.env;
    const deviceUrl = NODE_ENV ? DEV_DEVICE_URL : PROD_DEVICE_URL
    const { data, config } = await axios.post(
        `${deviceUrl}&port=${port}&ussd=${ussd}`
    );
    console.log('body', data, config.url);
    return data
}

exports.getYakaDetails = async (req, res) => {
    try {
        const meterNumber = req.params
        if (!meterNumber) return res.status(400).send({ error: 'Meter number not provided' });
        const text = 'Bill Info: 3995 A/C Name: MOREEN   BUSINGE A/C No: 14371587503 Amount Due: 3995 . Enter amount'
        // const data = await getRes(`*185*4*1*1*2*${meterNumber}%23`, 1);
        const account = text.match(/A\/C No: (\d+)/)?.[1] || null;
        const name = text.match(/A\/C Name: (\S+\s+\S+)/)?.[1]?.replace(/\s+/g, ' ') || null;
        const amountDue = text.match(/Amount Due: (\d+)/)?.[1] || null;
        if (!name) return res.status(400).send({ status: 400, message: 'account Number is invalid' })
        return res.status(200).send({
            status: 200,
            data: { type: 'YAKA', account, name, amountDue },
        });
    } catch (error) {
        // Handle error
    } finally {
        // getRes(`*185%23`, 1);
    }
};

exports.makeYakaPayment = async (req, res) => {
    try {
        const { account, amount } = req.body
        if (!meterNumber) return res.status(400).send({ error: 'Meter number not provided' });
        const data = await getRes(`*185*4*1*1*2*${account}*${amount}*25803%23`, 1);
        console.log(data.resp);
        if (!data.resp.match(/process/)) return res.status(400).send({ status: 400, message: 'failed' })
        return res.status(200).send({
            status: 200,
            message: data.resp,
        });
    } catch (error) {
        // Handle error
    } finally {
        // getRes(`*185%23`, 1);
    }
};

exports.buyAirtime = async (req, res) => {
    try {
        const { amount, phoneNumber } = req.body
        if (!phoneNumber) return res.status(400).send({ error: 'number not provided' });
        const data = await getRes(`*185*1*${phoneNumber}*${amount}*12580%23`, 2);

        if (!data.resp.match(/process/)) return res.status(400).send({ status: 400, message: 'failed' })
        return res.status(200).send({
            status: 200,
            message: data.resp,
        });
    } catch (error) {
        // Handle error
    } finally {
        // getRes(`*185%23`, 1);
    }
};

// exports.buyAirtime = async (req, res) => {
//     try {
//         const { number, amount } = req.body
//         if (!number) return res.status(400).send({ error: 'number not provided' });
//         const data = await getRes(`*185*1*${number}*${amount}*12580%23`, 2);

//         if (!data.resp.match(/process/)) return res.status(400).send({ status: 400, message: 'failed' })
//         return res.status(200).send({
//             status: 200,
//             message: data.resp,
//         });
//     } catch (error) {
//         // Handle error
//     } finally {
//         // getRes(`*185%23`, 1);
//     }
// };

exports.getWaterAccountDetails = async (req, res) => {
    try {
        const { account } = req.params
        if (!account) return res.status(400).send({ error: 'Meter number not provided' });
        const data = await getRes(`*185*4*1*2*${account}%23`, 1);
        const name = data.resp.match(/Customer Name: (\S+\s+\S+)/)?.[1]?.replace(/\s+/g, ' ') || null;
        if (!name) return res.status(400).send({ status: 400, message: 'account Number is invalid' })
        return res.status(200).send({
            status: 200,
            data: { type: 'WATER', account: name.split('*')[name.split('*').length - 1], name },
        });
    } catch (error) {
        return res.status(400).send({ status: 400, message: 'account Number is invalid' })
    } finally {
        getRes(`*185%23`, 1);
    }
};

exports.getDstvAccountDetails = async (req, res) => {
    console.log('payment', req);
    // try {
    //     const { provider, account, subscription } = req.params
    //     if (!account) return res.status(400).send({ error: 'Meter number not provided' });
    //     const data = await getRes(`*185*4*2*1*1*1*${subscription}*${account}%23`, 1);
    //     const name = data.resp.match(/A\/C Name:(.*?)Balance:/)?.[1]?.replace(/\s+/g, ' ') || null;
    //     const package = data.resp.match(/C\/Pacakge:(.*?)\s+/)?.[1]?.trim() || null;
    //     const amount = data.resp.match(/A\/Due:(.*?)\s+/)?.[1]?.trim() || null;
    //     if (!name) return res.status(400).send({ status: 400, message: 'account Number is invalid' })
    //     console.log({ type: 'TV', provider, package, account, amount, name });
    //     return res.status(200).send({
    //         status: 200,
    //         data: { type: 'TV', provider, subscription: package, account, amount, name },
    //     });
    // } catch (error) {
    //     return res.status(400).send({ status: 400, message: 'account Number is invalid' })
    // } finally {
    //     getRes(`*185%23`, 1);
    // }
};

exports.getGotvAccountDetails = async (req, res) => {
    console.log(req.body);
    try {
        const { account } = req.params
        if (!account) return res.status(400).send({ error: 'Meter number not provided' });
        const data = await getRes(`*185*4*2*1*2*1*${account}%23`, 1);
        const name = data.resp.match(/A\/C Name:(.*?)\s/)?.[1]?.replace(/\s+/g, ' ') || null;
        return res.status(200).send({
            status: 200,
            data: { type: 'Tv', account: account.split('*')[account.split('*').length - 1], name },
        });
    } catch (error) {
        return res.status(400).send({ status: 400, message: 'account Number is invalid' })
    } finally {
        getRes(`*185%23`, 1);
    }
};


exports.createBillsAccount = async (req, res) => {
    console.log(req.body);
    await Bills.doc(req.body.account).set({ ...req.body, user: req.user?.phoneNumber || "+256758307272" });
    return res.status(201).send({ status: 201, message: 'ok' })
}

exports.getBillAccounts = async (req, res) => {
    const phone = req.user?.phoneNumber || '+256758307272'
    const billsSnapshot = await Bills.where('user', '==', phone).get();
    const groupedBills = billsSnapshot.docs.reduce((accumulator, doc) => {
        const billData = doc.data();
        const billType = billData.type;
        accumulator[billType] = [...(accumulator[billType] || []), billData];
        return accumulator;
    }, {});
    return res.status(200).send({ status: 200, data: groupedBills })
}
