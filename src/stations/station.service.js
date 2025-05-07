const httpStatus = require('http-status');
const db = require('../firebase/config');
const ApiError = require('../utils/ApiError');
const admin = require('firebase-admin');

const Station = db.collection('stations')

const addStation = async (body) => {
  const station = await Station.doc(body.stationId).set(body);
  return station;
};

const getStations = async () => {
  const stations = (await Station.get()).docs.map(e => e.data());
  return stations;
};


const findStationByPhone = async (phoneNumber) => {
  const station = await Station.doc(phoneNumber).get()
  return station.data() || null;
};

const addAgentToStation = async (stationId, agentPhoneNumber) => {
  const phoneNumber = "+256" + agentPhoneNumber.substring(1);
    if (!/^0\d{9}$/.test(agentPhoneNumber)) {
      return false;
    }
  const station = await Station.doc(stationId).update({
    agents: admin.firestore.FieldValue.arrayUnion(phoneNumber)
  })
  return true;
};

const removeAgentToStation = async (stationId, agentPhoneNumber) => {
  const station = await Station.doc(stationId).update({
    agents: admin.firestore.FieldValue.arrayRemove(agentPhoneNumber)
  })
  return !!station;
};

const deleteStation = async (stationId) => {
  const station = await Station.findByIdAndDelete(stationId);
  if (!station) {
    throw new ApiError(httpStatus.NOT_FOUND, 'station not found');
  }
  await station.remove();
  return station;
};


module.exports = {
  addStation,
  getStations,
  deleteStation,
  findStationByPhone,
  addAgentToStation,
  removeAgentToStation,
};
