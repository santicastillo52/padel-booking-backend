const express = require('express');
const courtsSchedulesController = require('../controllers/courtsSchedules.controller');
const JWTmiddleware = require('../middlewares/authMiddleware');
const validator = require('../middlewares/validatorJoiMdw');
const { schedulesArray , scheduleId} = require('../schemas/schedules');
const { courtId } = require('../schemas/courts');
const { checkCourtOwnership, checkScheduleOwnership } = require('../middlewares/adminCheckMdw')
const router = express.Router();


/**
 * @swagger
 * /courts-schedules:
 *   get:
 *     tags: [CourtsSchedules]
 *     summary: Listar todos los horarios disponibles
 *     responses:
 *       200:
 *         description: Listado obtenido correctamente
 *       500:
 *         description: Error del servidor
 */
router.get('/', courtsSchedulesController.getAllCourtsSchedules);

/**
 * @swagger
 * /courts-schedules/{id}:
 *   post:
 *     tags: [CourtsSchedules]
 *     summary: Crear horarios para una cancha específica
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
 *               schedules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     start_time: { type: string, example: "09:00" }
 *                     end_time: { type: string, example: "10:00" }
 *                     day_of_week: { type: string, example: "monday" }
 *     responses:
 *       201:
 *         description: Horarios creados correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos para la cancha
 *       500:
 *         description: Error del servidor
 */
router.post('/:id', JWTmiddleware, validator(courtId, "params"), validator(schedulesArray), checkCourtOwnership, courtsSchedulesController.createCourtsSchedules);

/**
 * @swagger
 * /courts-schedules/{id}:
 *   delete:
 *     tags: [CourtsSchedules]
 *     summary: Eliminar un horario de cancha
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del horario a eliminar
 *     responses:
 *       200:
 *         description: Horario eliminado correctamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos para la cancha
 *       404:
 *         description: Horario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', JWTmiddleware, validator(scheduleId, "params"), checkScheduleOwnership, courtsSchedulesController.deleteCourtSchedule);

module.exports = router;