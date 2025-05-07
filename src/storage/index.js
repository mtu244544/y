const { Storage } = require('@google-cloud/storage');
const path = require('path')
const fs = require('fs');

// Creates a client using Application Default Credentials
const storage = new Storage({
  keyFilename: path.join(__dirname, "../firebase/serviceAccountKey.json"),
  projectId: 'yo-advance-energies'
});

const bucket = storage.bucket('yo-advance-energies.appspot.com');


exports.uploadFile = async (req, res) => {
  const docType = req.params.docType || 'NationalId'
  const phoneNumber = req.user?.phoneNumber || '+256758307272'
  try {
    const file = req.file;
    const uploadFilePath = path.join(file.destination, file.filename);
    const fileStream = fs.createReadStream(uploadFilePath);

    // Upload file to Google Cloud Storage
    const gcsFileName = `${docType}__${file.originalname}`;
    const gcsUploadStream = bucket.file(`${phoneNumber}/${gcsFileName} `).createWriteStream({
      metadata: { contentType: file.mimetype },
      resumable: false
    });
    fileStream.pipe(gcsUploadStream);

    // Handle upload completion
    gcsUploadStream.on('finish', () => {
      fs.unlinkSync(uploadFilePath); // Delete local upload file
      return res.status(200).send(`File uploaded to Google Cloud Storage: ${gcsFileName}`);
    });
  } catch (err) {
    console.error('ERROR:', err);
    return res.status(500).send('Internal server error');
  }
}

module.exports = router;
