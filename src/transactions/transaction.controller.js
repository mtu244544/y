const { createTransaction, getSingleTransaction, getTransactions, removeTransaction, getTransactionsByPhoneNumber } = require("./transaction.service");

const createUserTransaction = async (req, res) => {
  const dt = await createTransaction(req.body);
  return res.status(200).send({ message: "Transaction has been created" });
};

const getAllTransactions = async (req, res) => {
  const iGet = await getTransactions();
  return res.status(200).send(iGet);
};

const getUserTransaction = async (req, res) => {
  const data = await getSingleTransaction(req.params.transactionId);
  if (!data) return res.status(404).send({ status: 404, error: "Transaction Not Found" });
  return res.status(200).send({ status: 200, data });
};

const deleteTransaction = async (req, res) => {
  const gt = await removeTransaction(req.params.transactionId);
  if (gt === "") {
    return res.status(204).send(gt);
  }
  return res.status(404).send("Invalid transaction id");
};

const getUserTransactions = async (req, res) => {
  const data = await getTransactionsByPhoneNumber({
    ...req.query,
    msisdn: req.user.phoneNumber,
  });
  return res.status(200).send({
    data,
  });
};

module.exports = {
  createUserTransaction,
  getAllTransactions,
  getUserTransaction,
  deleteTransaction,
  getUserTransactions,
};
