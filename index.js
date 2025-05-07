const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./src/routes");
const dotenv = require("dotenv");
const cors = require("cors");
const cron = require('node-cron');
const { sendReminder } = require("./src/jobs/alert");

require("./src/jobs");
const app = express();

dotenv.config();

app.use(cors()); // Configure CORS to allow all domains

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '10mb' }));

app.use("/", routes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 422;
  const message = err.message || "An unexpected error occurred";
  res.status(statusCode).json({
    status: statusCode,
    error: message,
  });
});

cron.schedule('30 09 * * *', async () => {
  try {
    await sendReminder();
  } catch (error) {
    console.error('Error in cron job:', error);
  }
}, {
  timezone: 'Africa/Nairobi',
});

const server = app.listen(process.env.PORT || 9000, () => {
  console.log(`env ${process.env.NODE_ENV} running on port ${process.env.PORT || 9000}`);
});

module.exports = { app, server };