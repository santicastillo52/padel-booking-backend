const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');
const JWTmiddleware = require('../middlewares/authMiddleware');
const { checkBookingOwnershipOrAdmin } = require('../middlewares/bookingCheckMdw');
const validator = require('../middlewares/validatorJoiMdw');
const {bookingSchema, bookingCreateSchema, bookingUpdateSchema, bookingId} = require('../schemas/booking');

/**
 * @swagger
 * /bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Obtener todas las reservas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [confirmed, pending, completed, cancelled]
 *         description: Filtrar reservas por estado
 *     responses:
 *       200:
 *         description: Lista de reservas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bookings retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2024-01-15"
 *                       userId:
 *                         type: integer
 *                         example: 1
 *                       courtId:
 *                         type: integer
 *                         example: 1
 *                       courtScheduleId:
 *                         type: integer
 *                         example: 1
 *                       status:
 *                         type: string
 *                         enum: [pending, confirmed, cancelled, completed]
 *                         example: "confirmed"
 *                       clubId:
 *                         type: integer
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: No autorizado - Token JWT inválido o faltante
 *       500:
 *         description: Error del servidor
 */
router.get('/', JWTmiddleware, validator(bookingSchema), bookingsController.getAllBookings);
/**
 * @swagger
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Crear una nueva reserva
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courtId
 *               - courtScheduleId
 *               - date
 *             properties:
 *               courtId:
 *                 type: integer
 *                 example: 1
 *                 description: ID de la cancha
 *               courtScheduleId:
 *                 type: integer
 *                 example: 1
 *                 description: ID del horario de la cancha
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *                 description: Fecha de la reserva (YYYY-MM-DD)
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Booking created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-15"
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     courtId:
 *                       type: integer
 *                       example: 1
 *                     courtScheduleId:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       enum: [pending, confirmed, cancelled, completed]
 *                       example: "pending"
 *                     clubId:
 *                       type: integer
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Error de validación - Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation error"
 *                 error:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *       401:
 *         description: No autorizado - Token JWT inválido o faltante
 *       409:
 *         description: Conflicto - La cancha no está disponible o ya existe una reserva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "La cancha no esta disponible"
 *                 error:
 *                   type: string
 *                   example: "BOOKING_CREATE_ERROR"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error creating booking"
 *                 error:
 *                   type: string
 *                   example: "BOOKING_CREATE_ERROR"
 */
router.post('/', JWTmiddleware, validator(bookingCreateSchema), bookingsController.createBooking);
/**
 * @swagger
 * /bookings/{id}:
 *   patch:
 *     tags: [Bookings]
 *     summary: Actualizar el estado de una reserva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID de la reserva a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, pending, completed, cancelled]
 *                 example: "confirmed"
 *                 description: Nuevo estado de la reserva
 *     responses:
 *       200:
 *         description: Estado de la reserva actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Booking status updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-15"
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     courtId:
 *                       type: integer
 *                       example: 1
 *                     courtScheduleId:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       enum: [confirmed, pending, completed, cancelled]
 *                       example: "confirmed"
 *                     clubId:
 *                       type: integer
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T11:00:00.000Z"
 *       400:
 *         description: Error de validación - Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation error"
 *                 error:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *       401:
 *         description: No autorizado - Token JWT inválido o faltante
 *       403:
 *         description: Acceso denegado - Solo puedes modificar tus propias reservas o ser admin del club
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Solo puedes modificar tus propias reservas"
 *                 error:
 *                   type: string
 *                   example: "FORBIDDEN_ACCESS"
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reserva no encontrada"
 *                 error:
 *                   type: string
 *                   example: "BOOKING_NOT_FOUND"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error updating booking status"
 *                 error:
 *                   type: string
 *                   example: "BOOKING_UPDATE_ERROR"
 */
router.patch('/:id', JWTmiddleware, validator(bookingUpdateSchema), validator(bookingId, "params"), checkBookingOwnershipOrAdmin, bookingsController.updateBookingStatus);
/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     tags: [Bookings]
 *     summary: Eliminar una reserva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID de la reserva a eliminar
 *     responses:
 *       200:
 *         description: Reserva eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Booking deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-15"
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     courtId:
 *                       type: integer
 *                       example: 1
 *                     courtScheduleId:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       enum: [confirmed, pending, completed, cancelled]
 *                       example: "confirmed"
 *                     clubId:
 *                       type: integer
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Error de validación - ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation error"
 *                 error:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *       401:
 *         description: No autorizado - Token JWT inválido o faltante
 *       403:
 *         description: Acceso denegado - Solo puedes eliminar tus propias reservas o ser admin del club
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Solo puedes eliminar tus propias reservas"
 *                 error:
 *                   type: string
 *                   example: "FORBIDDEN_ACCESS"
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reserva no encontrada"
 *                 error:
 *                   type: string
 *                   example: "BOOKING_NOT_FOUND"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error deleting booking"
 *                 error:
 *                   type: string
 *                   example: "BOOKING_DELETE_ERROR"
 */
router.delete('/:id', JWTmiddleware, validator(bookingId, "params"), checkBookingOwnershipOrAdmin, bookingsController.deleteBooking);

module.exports = router;

