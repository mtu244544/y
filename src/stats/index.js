const { getSystemBalance, getSystemReserve } = require("../payments/api");
const { getNegativeUsersBalances, getTotalAccountBalance } = require("../users/user.service");

const getStats = async (req, res) => {
    try {


        const [overdraft, reserve, systemBalance, systemReserve] = await Promise.all([
            getNegativeUsersBalances(),
            getTotalAccountBalance(),
            getSystemBalance(),
            getSystemReserve()])
        res.status(200).send({ data: { overdraft, reserve, systemBalance, systemReserve } });
    } catch (error) {
        res.status(200).send({ data: { overdraft: 0, reserve: 0, systemBalance: 0, systemReserve: 0 } });
    }
}

module.exports = getStats;