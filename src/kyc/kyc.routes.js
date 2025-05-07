const express = require("express");
const db = require("../firebase/config");
const { default: axios } = require("axios");
const Kyc = db.collection("kyc");
const User = db.collection("users");
const https = require('https');
const { verifyToken } = require("../auth/otp.controller");
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
    keyFilename: path.join(__dirname, '../firebase/serviceAccountKey.json'),
    projectId: 'yo-advance-energies'
});

const bucket = storage.bucket('yo-advance-energies.appspot.com');

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
    const kycDocument = await Kyc.doc(req.user.phoneNumber).get();
    if (kycDocument.exists) {
        const kycData = kycDocument.data();
        return res.status(200).send({ status: 200, message: 'KYC data retrieved successfully', data: kycData });
    } else {
        return res.status(404).send({ status: 404, message: 'KYC data not found' });
    }
});

router.get("/:nin", async (req, res) => {
    const agent = new https.Agent({
        rejectUnauthorized: false
    });
    try {
        // Fetch user info from the NIRA API
        const payload = await axios.post('https://emis.go.ug/api/nira/user-info', { "id_number": req.params.nin }, { httpsAgent: agent });

        // Fetch user's photo from the provided URL
        const resp = await axios.get(payload.data.photo_url, { httpsAgent: agent, responseType: 'arraybuffer' });

        // Convert image data to Buffer
        const imageData = Buffer.from(resp.data, 'binary');

        // Create a writable stream to upload the image to Google Cloud Storage
        const blobStream = bucket.file(`avatar/${payload.data.photo}`).createWriteStream({
            metadata: { contentType: 'image/png' },
            resumable: false
        });

        // Pipe image data to the upload stream
        blobStream.end(imageData);

        // Handle upload completion
        blobStream.on('finish', async () => {
            const [url] = await bucket.file(`avatar/${payload.data.photo}`).getSignedUrl({ action: 'read', expires: '01-01-2100' });
            req.url = url;

            // Respond with user data including the photo URL
            const { nationality, gender, national_id, full_name, date_of_birth } = payload.data;
            await User.doc(`+${req.query.phoneNumber.trim()}`).update({ photo: url, phoneNumber: `+${req.query.phoneNumber.trim()}`, NIN: national_id, nationality, gender, name: full_name, date_of_birth }, { merge: true })
            return res.status(200).send({ data: { date_of_birth, nationality, NIN: national_id, gender, name: full_name, photo: req.url } });
        });

        // Handle errors during upload
        blobStream.on('error', (error) => {
            console.error('Error uploading image:', error);
            res.status(500).send({ status: 500, error: 'Internal server error' });
        });
    } catch (error) {
        if (error.message?.match('ECONNREFUSED')) {
            await User.doc(`+${req.query.phoneNumber.trim()}`).update({ NIN: req.params.nin }, { merge: true })
            return res.status(200).send({ status: 200, data: {}, message: 'auto data validation failed' });
        }
        return res.status(422).send({ status: 422, error: 'Unable to validate data' });
    }
});


module.exports = router;