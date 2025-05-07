const express = require('express');
const { getIncomingMessage, getWhatsappHook } = require('./whatsapp.controller');
const { checkRegistrationStatus } = require('../ussd/ussd.midlware');

const router = express.Router();


router.post('/incoming',
  checkRegistrationStatus,
  getIncomingMessage
);

router.get('/incoming',
  getWhatsappHook
);

// router.delete('/:id',
//   deleteStation
// );


// router.patch('/:stationId/:agentPhoneNumber/add',
//   addAgentToStation
// );

// router.patch('/:stationId/:agentPhoneNumber/remove',
//   removeAgentToStation
// );


module.exports = router;