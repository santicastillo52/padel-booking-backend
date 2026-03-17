const express = require('express');
const authController = require('../controllers/auth.controller');
const {loginLimiter} = require('../middlewares/rateLimitMdw')
const validator = require('../middlewares/validatorJoiMdw');
const { loginUserSchema, registerUserSchema } = require('../schemas/auth');

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login de usuario
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: OK }
 *       401: { description: El usuario no existe }
 */
router.post('/login', loginLimiter, validator(loginUserSchema), authController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register de usuario
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 50 }
 *               last_name: { type: string, maxLength: 50 }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               position: { type: string, enum: [backhand, forehand, both] }
 *               level: { type: integer, minimum: 1, maximum: 8 }
 *               gender: { type: string, enum: [male, female, unspecified] }
 *     responses:
 *       200: { description: OK }
 *       401: { description: No autorizado }
 *       409: {description: El usuario ya existe}
 *       500: {description: error del servidor}
 */
router.post('/register', validator(registerUserSchema), authController.register);



module.exports = router;