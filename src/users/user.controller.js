const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { queryUsers, getUserByPhoneNumber, updateUserById, deleteUserById, createUserAccount, verifyUserKyc } = require("./user.service");
const { getTransactionByPhoneNumber } = require("../transactions/transaction.service");

const createUser = catchAsync(async (req, res) => {
  const userExists = await getUserByPhoneNumber(req.body.phoneNumber);
  // const transaction = await getTransactionByPhoneNumber(req.body.phoneNumber)
  // if (!transaction) {
  //   return res.status(404).send({ error: "TransactionId not Found in the system" });
  // }
  // if (userExists) {
  //   return res.status(409).send({ status: 409, error: "Account already Registered" });
  // }
  const user = await createUserAccount(req.body);
  return res.status(httpStatus.CREATED).send({ message: "User has been created", data: user });
});

const verifyUserInfo = catchAsync(async (req, res) => {
  const data = await verifyUserKyc(req.params.phoneNumber, req.body.status);
  return res.status(200).send({ status: 200, message: 'Status updated successfully', data });
})

const getUsers = catchAsync(async (req, res) => {
  const data = await queryUsers(req.user, req.query);
  return res.status(200).send({ status: 200, data });
});

const getUserProfile = catchAsync(async (req, res) => {
  const user = await getUserByPhoneNumber(req.user.phoneNumber);
  return res.status(200).send(user);
});

const getUser = catchAsync(async (req, res) => {
  const user = await getUserByPhoneNumber(req.params.phoneNumber);
  return res.status(200).send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await deleteUserById(req.params.phoneNumber);
  return res.status(200).send({ message: "User deleted successfully" });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserProfile,
  verifyUserInfo
};
