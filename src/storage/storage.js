const express = require('express');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const multer = require('multer');
const db = require("../firebase/config");
const User = db.collection("users");


const router = express.Router();

const storage = new Storage({
    keyFilename: path.join(__dirname, '../firebase/serviceAccountKey.json'),
    projectId: 'yo-advance-energies'
});

exports.bucket = storage.bucket('yo-advance-energies.appspot.com');

const upload = multer({ storage: multer.memoryStorage() });

// const upload = multer({ storage: storage });

router.post('/', upload.single('image'), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }
    
    const blob = this.bucket.file(`KYC/${file.originalname}`);
    const blobStream = blob.createWriteStream();

    blobStream.on('finish', async () => {
        const [url] = await blob.getSignedUrl({ action: 'read', expires: '01-01-2100' });
        const fileName = file.originalname.replace('.png', '')
        User.doc(fileName).set({ support_doc: { url, status: 'IN_REVIEW' } }, { merge: true });
        res.status(200).json({ status: 200, message: 'Upload successful' });
    });
    blobStream.end(file.buffer);
});

module.exports = router;

