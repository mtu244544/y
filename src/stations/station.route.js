const express = require("express");
const { addStation, deleteStation, getStations, addAgentToStation, removeAgentToStation } = require("./station.controller");

const router = express.Router();

router.post("/", addStation);
router.delete("/:id", deleteStation);
router.get("/", getStations);

router.patch("/:stationId/:agentPhoneNumber/add", addAgentToStation);

router.patch("/:stationId/:agentPhoneNumber/remove", removeAgentToStation);

module.exports = router;
