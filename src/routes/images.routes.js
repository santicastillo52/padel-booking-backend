
const express = require('express');
const router = express.Router();
const { uploadMemory } = require('../config/multer');
const Image = require('../models/Image');
const imageController = require('../controllers/images.controller');
const JWTmiddleware = require('../middlewares/authMiddleware');
const { checkImageOwnership } = require('../middlewares/adminCheckMdw');
const { imageId, imageTypes, uploadImage } = require('../schemas/images')
const validator = require('../middlewares/validatorJoiMdw');

/**
 * @swagger
 * /images:
 *   get:
 *     tags: [Images]
 *     summary: Listar todas las imágenes
 *     responses:
 *       200:
 *         description: Listado obtenido correctamente
 *       500:
 *         description: Error del servidor
 */
router.get('/', imageController.getAllImages);

/**
 * @swagger
 * /images/{id}:
 *   patch:
 *     tags: [Images]
 *     summary: Actualizar una imagen existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la imagen
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 enum: [court, club]
 *               clubId:
 *                 type: integer
 *               courtId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Imagen actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id', JWTmiddleware, uploadMemory.single('image'), validator(imageId, 'params'),validator(imageTypes, 'formData'), checkImageOwnership,  imageController.updateImage);
//corroborar el formato de imagen- debe traer type(court o club), clubId y courtId solo falta esto, revisar codigo y agregar las respuestas en controller
//router.post('/upload', uploadMemory.single('image'), imageController.uploadImage);

module.exports = router;
