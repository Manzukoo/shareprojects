const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const images = {};

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../public/storage/img"),
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname).toLocaleLowerCase());
  },
});

images.upload = multer({
  storage,
  dest: path.join(__dirname, "../public/storage/img"),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname));

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      "Error: Solo puedes subir imagenes con las extensiones jpeg, jpg y png."
    );
  },
}).single("project_image");

module.exports = images;
