const express = require('express');
const router = express.Router();
const config = require('config');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const path = require('path');

/** Middleware */
const upload = require('../../middleware/upload');

/** Init GFS */
const mongoURI = config.get('mongoURI');
const conn = mongoose.createConnection(mongoURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log('GFS PDF instance initialize...');
});

// @route           POST /upload
// @description:    Upload PDF
// access:          Public
router.post('/upload', async (req, res) => {
  try {
    await upload(req, res);
    if (req.file == undefined) {
      return res.send(`You must select a file.`);
    }

    return res.json({ msg: 'file upload', file: req.file });
  } catch (error) {
    console.log(error);
    return res.send(`Error when trying upload image: ${error}`);
  }
});

// @route           GET       /pdf/fileid/:id'
// @desc            Display PDF by file name
// access:          Public
router.get('/pdf/fileid/:id', (req, res) => {
  gfs.files.findOne(
    { _id: mongoose.Types.ObjectId(req.params.id) },
    (err, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exist',
        });
      }

      if (file.contentType === 'application/pdf') {
        /** Read output to browser */
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({ err: 'Not an pdf' });
      }
    }
  );
});

// @route           GET       api/pdf
// @desc            Display PDF by file name
// access:          Public
router.get('/', (req, res) => {
  gfs.files.find({ contentType: 'application/pdf' }).toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist',
      });
    }
    return res.send(files);
  });
});

module.exports = router;
