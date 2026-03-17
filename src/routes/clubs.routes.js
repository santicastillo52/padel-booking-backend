const express = require('express');
const clubController = require('../controllers/clubs.controller');
const { uploadMemory } = require('../config/multer');
const JWTmiddleware = require('../middlewares/authMiddleware');
const {ownerCheck} = require('../middlewares/adminCheckMdw');
const validator = require('../middlewares/validatorJoiMdw');
const {clubId, createClub } = require('../schemas/clubs')

const router = express.Router();

/**
 * @swagger
 * /clubs:
 *   get:
 *     tags: [Clubs]
 *     summary: Obtener todos los clubes
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar clubes por nombre (búsqueda parcial)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtrar clubes por ubicación (búsqueda parcial)
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Filtrar club por ID
 *     responses:
 *       200:
 *         description: Lista de clubes obtenida exitosamente
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
 *                   example: "Clubs retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Club Deportivo Central"
 *                       address:
 *                         type: string
 *                         example: "Av. Principal 123"
 *                       phone:
 *                         type: string
 *                         example: "1234567890"
 *                       email:
 *                         type: string
 *                         example: "contacto@clubcentral.com"
 *                       UserId:
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
 *                   example: "Error retrieving clubs"
 *                 error:
 *                   type: string
 *                   example: "CLUBS_FETCH_ERROR"
 */
router.get('/', clubController.getAllClubs);

/**
 * @swagger
 * /clubs/dropdown:
 *   get:
 *     tags: [Clubs]
 *     summary: Obtener lista simplificada de clubes para dropdown
 *     description: Retorna solo ID y nombre de los clubes para usar en selectores/dropdowns
 *     responses:
 *       200:
 *         description: Lista de clubes para dropdown obtenida exitosamente
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
 *                   example: "Dropdown clubs retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Club Deportivo Central"
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
 *                   example: "Error retrieving clubs"
 *                 error:
 *                   type: string
 *                   example: "CLUBS_DROPDOWN_ERROR"
 */
router.get('/dropdown', clubController.getDropdownClubs);

/**
 * @swagger
 * /clubs/me:
 *   get:
 *     tags: [Clubs]
 *     summary: Obtener el club del usuario autenticado
 *     description: Retorna el club asociado al usuario propietario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Club del usuario obtenido exitosamente
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
 *                   example: "Your club retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Club Deportivo Central"
 *                     address:
 *                       type: string
 *                       example: "Av. Principal 123"
 *                     phone:
 *                       type: string
 *                       example: "1234567890"
 *                     email:
 *                       type: string
 *                       example: "contacto@clubcentral.com"
 *                     UserId:
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
 *       401:
 *         description: No autorizado - Token JWT inválido o faltante
 *       403:
 *         description: Acceso denegado - Solo propietarios pueden acceder
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Solo los propietarios pueden acceder a esta funcionalidad"
 *       404:
 *         description: Club no encontrado
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
 *                   example: "No tienes un club registrado"
 *                 error:
 *                   type: string
 *                   example: "USER_CLUB_NOT_FOUND"
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
 *                   example: "Error retrieving club"
 *                 error:
 *                   type: string
 *                   example: "MY_CLUB_FETCH_ERROR"
 */
router.get('/me', JWTmiddleware, ownerCheck, clubController.getMyClub);

/**
 * @swagger
 * /clubs/{id}:
 *   get:
 *     tags: [Clubs]
 *     summary: Obtener un club específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID del club a obtener
 *     responses:
 *       200:
 *         description: Club obtenido exitosamente
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
 *                   example: "Club retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Club Deportivo Central"
 *                     address:
 *                       type: string
 *                       example: "Av. Principal 123"
 *                     phone:
 *                       type: string
 *                       example: "1234567890"
 *                     email:
 *                       type: string
 *                       example: "contacto@clubcentral.com"
 *                     UserId:
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
 *       404:
 *         description: Club no encontrado
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
 *                   example: "Club not found"
 *                 error:
 *                   type: string
 *                   example: "CLUB_NOT_FOUND"
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
 *                   example: "Error retrieving club"
 *                 error:
 *                   type: string
 *                   example: "CLUB_FETCH_ERROR"
 */
router.get('/:id', JWTmiddleware, validator(clubId, 'params'), clubController.getOneClub);

/**
 * @swagger
 * /clubs:
 *   post:
 *     tags: [Clubs]
 *     summary: Crear un nuevo club
 *     description: Crea un nuevo club con imagen. Requiere autenticación y rol de propietario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - phone
 *               - email
 *               - UserId
 *               - images
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "Club Deportivo Central"
 *                 description: Nombre del club
 *               address:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Av. Principal 123"
 *                 description: Dirección del club
 *               phone:
 *                 type: integer
 *                 example: 1234567890
 *                 description: Teléfono de contacto del club
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contacto@clubcentral.com"
 *                 description: Email de contacto del club
 *               UserId:
 *                 type: integer
 *                 example: 1
 *                 description: ID del usuario propietario del club
 *               images:
 *                 type: file
 *                 description: Imagen del club (jpg, jpeg, png, gif, webp - máx 5MB)
 *     responses:
 *       201:
 *         description: Club creado exitosamente
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
 *                   example: "Club created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Club Deportivo Central"
 *                     address:
 *                       type: string
 *                       example: "Av. Principal 123"
 *                     phone:
 *                       type: string
 *                       example: "1234567890"
 *                     email:
 *                       type: string
 *                       example: "contacto@clubcentral.com"
 *                     UserId:
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
 *       403:
 *         description: Acceso denegado - Solo propietarios pueden crear clubes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Solo los propietarios pueden acceder a esta funcionalidad"
 *       409:
 *         description: Conflicto - El usuario ya tiene un club registrado
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
 *                   example: "Este usuario ya tiene un club"
 *                 error:
 *                   type: string
 *                   example: "CLUB_CREATE_ERROR"
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
 *                   example: "Error creating club"
 *                 error:
 *                   type: string
 *                   example: "CLUB_CREATE_ERROR"
 */
router.post('/', JWTmiddleware, uploadMemory.single('images'), validator(createClub, 'formData'), clubController.createClub);
//Cuando agregemos update y delete. Solo deben poder ser accedidas si el usuario es el dueño del club

module.exports = router;