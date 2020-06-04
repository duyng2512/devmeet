const GridFsStorage = require('multer-gridfs-storage');
const multer = require('multer');
const config = require('config');
const crypto = require('crypto');
const util = require('util');
const path = require('path');

/** Create Storage */
const storage = new GridFsStorage({
  url: config.get('mongoURI'),
  options: { useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage }).single('file');
var uploadFilesMiddleware = util.promisify(upload);
module.exports = uploadFilesMiddleware;
