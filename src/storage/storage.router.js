// const express = require('express');
// const { Storage } = require('@google-cloud/storage');
// const path = require('path');
// const formidable = require("formidable-serverless");
// const firebase = require("firebase-admin");
// const UUID = require("uuid-v4");


// const router = express.Router();

// // Set up Google Cloud Storage client
// // const storage = new Storage({
// //   keyFilename: path.join(__dirname, '../firebase/serviceAccountKey.json'),
// //   projectId: 'yo-advance-energies'
// // });

// // const bucket = storage.bucket('yo-advance-energies.appspot.com');

// // const upload = multer({ storage: multer.memoryStorage() });

// // Set up route to handle file uploads
// router.post('/', async (req, res) => {
//   // const docType = req.params.docType || 'NationalId'
//   // const phoneNumber = req.user?.phoneNumber || '+256758307272'
//   // try {
//   //   const file = req.file;
//   //   const uploadFilePath = path.join(file.destination, file.filename);
//   //   const fileStream = fs.createReadStream(uploadFilePath);

//   //   // Upload file to Google Cloud Storage
//   //   const gcsFileName = `${docType}__${file.originalname}`;
//   //   const gcsUploadStream = bucket.file(`${phoneNumber}/${gcsFileName} `).createWriteStream({
//   //     metadata: { contentType: file.mimetype },
//   //     resumable: false
//   //   });
//   //   fileStream.pipe(gcsUploadStream);

//   //   // Handle upload completion
//   //   gcsUploadStream.on('finish', () => {
//   //     fs.unlinkSync(uploadFilePath); // Delete local upload file
//   //     return res.status(200).send(`File uploaded to Google Cloud Storage: ${gcsFileName}`);
//   //   });
//   // } catch (err) {
//   //   console.error('ERROR:', err);
//   //   return res.status(500).send('Internal server error');
//   // }
//   const docType = req.params.docType || 'NationalId'
//   const phoneNumber = req.user?.phoneNumber || '+256758307272'
//   var form = new formidable.IncomingForm();
//   return new Promise((resolve, reject) => {
//     form.parse(req, async (err, fields, files) => {
//       var file = files.file;
//       if (!file) {
//         reject(new Error("no file to upload, please choose a file."));
//         return;
//       }
//       var filePath = file.path;

//       const storage = new Storage({
//         keyFilename: path.join(__dirname, '../firebase/serviceAccountKey.json'),
//         projectId: 'yo-advance-energies'
//       });

//       let uuid = UUID();

//       const response = await storage.bucket('yo-advance-energies.appspot.com').upload(filePath, {
//         contentType: file.type,
//         destination: `${phoneNumber}/${docType}__${file.name}`,
//         metadata: {
//           metadata: {
//             firebaseStorageDownloadTokens: uuid,
//           },
//         },
//       });
//       resolve({ fileInfo: response[0].metadata }); // Whole thing completed successfully.
//     });
//   })
//     .then((response) => {
//       return res.status(200).json({ response });
//       return null;
//     })
//     .catch((err) => {
//       console.error("Error while parsing form: " + err);
//       return res.status(500).json({ error: err });
//     });
// });

// module.exports = router;

