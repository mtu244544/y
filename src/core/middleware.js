const { getStationByMerchantId } = require("../jobs/stations");
const catchAsync = require("../utils/catchAsync");

// Middleware to get station info by merchantId
exports.getMerchantInfo = catchAsync(async (req, res, next) => {
  req.body.station = await getStationByMerchantId(req, res, next);
  next();
});

// Route handler to get station by merchantId
exports.getStationById = catchAsync(async (req, res) => {
  if (!req.params.merchantId) {
    throw new ApiError(400, "Missing merchantId or amount in the request.");
  }
  const station = await getStationByMerchantId(req.params);
  return res.status(200).send({ status: 200, data: station });
});
