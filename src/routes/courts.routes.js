const express = require('express');
const courtsController = require('../controllers/courts.controller');
const { uploadMemory } = require('../config/multer');
const JWTmiddleware = require('../middlewares/authMiddleware');
const { checkCourtOwnership, checkClubOwnershipForCourts } = require('../middlewares/adminCheckMdw');
const validator = require('../middlewares/validatorJoiMdw');
const {courtId, courtFilters, updatedCourtSchema} = require('../schemas/courts');
const router = express.Router();

/**
 * @swagger
 * /courts:
 *   get:
 *     tags: [Courts]
 *     summary: Obtener todas las canchas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nombre de cancha
 *       - in: query
 *         name: wall_type
 *         schema:
 *           type: string
 *           enum: [cement, acrylic]
 *         description: Filtrar por tipo de pared
 *       - in: query
 *         name: court_type
 *         schema:
 *           type: string
 *           enum: [indoor, outdoor]
 *         description: Filtrar por tipo de cancha
 *       - in: query
 *         name: clubId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del club
 *     responses:
 *       200:
 *         description: Canchas obtenidas exitosamente
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/', JWTmiddleware, checkCourtOwnership, courtsController.getAllCourts);
/**
 * @swagger
 * /courts/available:
 *   get:
 *     tags: [Courts]
 *     summary: Obtener canchas disponibles con horarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: day_of_week
 *         schema:
 *           type: string
 *           enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *         description: Filtrar por día de la semana
 *       - in: query
 *         name: start_time
 *         schema:
 *           type: string
 *           format: time
 *         description: Hora de inicio (HH:mm:ss)
 *       - in: query
 *         name: end_time
 *         schema:
 *           type: string
 *           format: time
 *         description: Hora de fin (HH:mm:ss)
 *       - in: query
 *         name: clubId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del club
 *       - in: query
 *         name: wall_type
 *         schema:
 *           type: string
 *           enum: [cement, acrylic]
 *         description: Filtrar por tipo de pared
 *       - in: query
 *         name: court_type
 *         schema:
 *           type: string
 *           enum: [indoor, outdoor]
 *         description: Filtrar por tipo de cancha
 *     responses:
 *       200:
 *         description: Canchas disponibles obtenidas exitosamente
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/available', JWTmiddleware, validator(courtFilters, 'query'), courtsController.getAvailableCourts);
/**
 * @swagger
 * /courts/{id}:
 *   get:
 *     tags: [Courts]
 *     summary: Obtener una cancha por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cancha
 *     responses:
 *       200:
 *         description: Cancha obtenida exitosamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Cancha no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', JWTmiddleware, validator(courtId, 'params'), courtsController.getCourtById);
/**
 * @swagger
 * /courts:
 *   post:
 *     tags: [Courts]
 *     summary: Crear una o más canchas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               courts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     clubId:
 *                       type: integer
 *                     court_type:
 *                       type: string
 *                       enum: [indoor, outdoor]
 *                     wall_type:
 *                       type: string
 *                       enum: [cement, acrylic]
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Imágenes de las canchas (una por cancha)
 *     responses:
 *       201:
 *         description: Canchas creadas exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos para crear canchas en este club
 *       500:
 *         description: Error del servidor
 */
router.post('/', JWTmiddleware, uploadMemory.any(), checkClubOwnershipForCourts, courtsController.createCourts);
/**
 * @swagger
 * /courts/{id}:
 *   patch:
 *     tags: [Courts]
 *     summary: Editar una cancha existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cancha
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               court_type:
 *                 type: string
 *                 enum: [indoor, outdoor]
 *               wall_type:
 *                 type: string
 *                 enum: [cement, acrylic]
 *               available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cancha actualizada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos para editar esta cancha
 *       404:
 *         description: Cancha no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id', JWTmiddleware, validator(courtId, 'params'), validator(updatedCourtSchema), checkCourtOwnership, courtsController.editCourt);
/**
 * @swagger
 * /courts/{id}:
 *   delete:
 *     tags: [Courts]
 *     summary: Eliminar una cancha
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cancha
 *     responses:
 *       200:
 *         description: Cancha eliminada exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos para eliminar esta cancha
 *       404:
 *         description: Cancha no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', JWTmiddleware, validator(courtId, 'params'), checkCourtOwnership, courtsController.deleteCourt);

module.exports = router;