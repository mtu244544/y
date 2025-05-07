const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const stationService = require('./station.service');

const addStation = catchAsync(async (req, res) => {
  const user = await stationService.addStation(req.body);
  return res.status(httpStatus.CREATED).send(user);
});

const getStations = catchAsync(async (req, res) => {
  const result = await stationService.getStations();
  return res.send(result);
});


const deleteStation = catchAsync(async (req, res) => {
  await stationService.deleteStation(req.params.userId);
  return res.status(httpStatus.NO_CONTENT).send();
});

const addAgentToStation = catchAsync(async (req, res) => {
  const results = await stationService.addAgentToStation(req.params.stationId, req.params.agentPhoneNumber);
  if (results) {
    return res.status(200).send({ status: 200, message: 'update successful' });
  }
  return res.status(403).send({ status: 403, message: 'update failed' });
});

const removeAgentToStation = catchAsync(async (req, res) => {
  const results = await stationService.removeAgentToStation(req.params.stationId, req.params.agentPhoneNumber);
  if (results) {
    return res.status(200).send({ status: 200, message: 'update successful' });
  }
  return res.status(403).send({ status: 403, message: 'update failed' });
});

module.exports = {
  getStations,
  addStation,
  deleteStation,
  addAgentToStation,
  removeAgentToStation
};
