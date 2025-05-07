const DebtService = require("./service");
const SharedService = require("../sharedServices/shared");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const { getPricingList } = require("../settings");

const Controller = {
  // Get debts for a user
  getUserDebts: catchAsync(async (req, res) => {
    const data = await DebtService.getUserDebts(req.params.phoneNumber, req.query);
    res.status(200).json({ data });
  }),

  // Repay a debt
  requestPay: catchAsync(async (req, res) => {
    const debt = await DebtService.repayDebt(req.body);
    if (debt.error) {
      throw new ApiError(400, debt.error);
    }
    res.status(200).json({ message: debt.message });
  }),

  // Get all debts
  getAllDebts: catchAsync(async (req, res) => {
    const data = await DebtService.getAllLoansList();
    res.status(200).json(data);
  }),

  // Delete a debt
  deleteDebt: catchAsync(async (req, res) => {
    const deleted = await DebtService.removeLoanDetails(req.body.id);
    if (!deleted) {
      throw new ApiError(404, "Failed to delete");
    }
    res.status(200).json(deleted);
  }),

  // Borrow fuel
  borrowFuel: catchAsync(async (req, res) => {
    console.log('=======2.1')
    const response = await SharedService.confirmBorrowFuel(req);
    console.log('=======2.2')
    if (!response) {
      throw new ApiError(422, "Payment Failed");
    }
    res.status(200).json({ status: 200, ...response });
  }),

  // Charge for fuel
  chargeFuel: catchAsync(async (req, res) => {
    const response = await SharedService.confirmGetFuel(req);
    if (!response) {
      throw new ApiError(422, "Payment Failed");
    }
    res.status(200).json({ status: 200, ...response });
  }),

  getPricing: catchAsync(async (req, res) => {
    const pricing = await getPricingList();
    return res.status(200).json({ status: 200, data: pricing });
  }),
};

module.exports = Controller;
