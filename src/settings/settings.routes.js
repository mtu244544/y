const express = require("express");
const { getSettings, updateSettings } = require(".");

const router = express.Router();

router.get("/", async (req, res) => {
  const settings = await getSettings();
  return res.send({ data: settings });
});

router.post("/update", async (req, res) => {
  const settingsObject = await updateSettings(req.body);
  if (settingsObject) {
    return res.status(200).send({ message: "Settings updated successfully" });
  } else {
    return res.status(400).send({ message: "Failed to update" });
  }
});

module.exports = router;
