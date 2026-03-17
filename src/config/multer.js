// config/multer.js
const multer = require('multer');
const path = require('path');

// Carpeta donde se guardarán las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // asegúrate de que esta carpeta exista
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

// Storage en memoria para archivos temporales
const memoryStorage = multer.memoryStorage();

const upload = multer({ storage });
const uploadMemory = multer({ storage: memoryStorage });

module.exports = { upload, uploadMemory };
