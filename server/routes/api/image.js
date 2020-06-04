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
  console.log('GFS Image instance initialize...');
});

// @route           GET /
// @description:    Sandbox to testing this route
// access:          Public
router.get('/', (req, res) => {
  return res.sendFile(path.join(`${__dirname}/../../views/index.html`));
});

// @route           POST /upload
// @description:    Upload image
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

// @route           GET / files
// @desc            Display all files in JSON
// access:          Public
router.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    /** Check if file exist */
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No file exist',
      });
    }

    return res.json(files);
  });
});

// @route           GET /files/:filename
// @desc            Display 1 JSON file
// access:          Public
router.get('/filename/:filename', (req, res) => {
  console.log(req.params.filename);
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exist',
      });
    }

    return res.json(file);
  });
});

// @route           GET /files/:filename
// @desc            Display 1 JSON file by ID
// access:          Public
router.get('/fileid/:id', (req, res) => {
  console.log(req.params.id);
  gfs.files
    .find({ _id: mongoose.Types.ObjectId(req.params.id) })
    .toArray((err, file) => {
      if (!file) {
        return res.status(404).json({
          err: 'No file exist',
        });
      }

      return res.send(file);
    });
});

// @route           GET       /image/:filename
// @desc            Display image by file name
// access:          Public
router.get('/image/filename/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exist',
      });
    }

    if (
      file.contentType === 'image/jpeg' ||
      file.contentType === 'image/jpg' ||
      file.contentType === 'image/png'
    ) {
      /** Read output to browser */
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({ err: 'Not an image' });
    }
  });
});

// @route           GET       /image/:filename
// @desc            Display image by file name
// access:          Public
router.get('/image/fileid/:id', (req, res) => {
  gfs.files.findOne(
    { _id: mongoose.Types.ObjectId(req.params.id) },
    (err, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exist',
        });
      }

      if (
        file.contentType === 'image/jpeg' ||
        file.contentType === 'image/jpg' ||
        file.contentType === 'image/png'
      ) {
        /** Read output to browser */
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({ err: 'Not an image' });
      }
    }
  );
});

// @route DEL       /files/:filename
// @desc            Delete chunks from the DB
// access:          Public
router.delete('/:file_id', (req, res) => {
  gfs.remove({ _id: req.params.file_id, root: 'uploads' }, (err, GridStore) => {
    if (err) return res.status(404).json({ err: err.message });
    return res.json({
      msg: 'File deleted !',
    });
  });
});

module.exports = router;
