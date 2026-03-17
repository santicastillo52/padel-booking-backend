const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  /**
   * Define la carpeta donde se guardarán los archivos.
   * @param {Express.Request} req 
   * @param {Express.Multer.File} file 
   * @param {function} cb - Callback con error o ruta.
   */
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  /**
   * Define el nombre del archivo guardado.
   * @param {Express.Request} req 
   * @param {Express.Multer.File} file 
   * @param {function} cb - Callback con error o nombre.
   */
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = upload;
