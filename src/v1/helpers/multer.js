const multer  = require('multer')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/public/images/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ 
    limits: {
      fileSize: 4 * 1024 * 1024,
    },
    storage: storage,
});

module.exports = upload;
