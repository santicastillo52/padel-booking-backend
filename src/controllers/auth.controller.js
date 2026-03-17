const passport = require('passport');
const jwt = require('../providers/jwt.provider');
const authService = require('../services/auth.services');

/**
 * Controlador para manejar el login de usuario.
 * Usa Passport con estrategia 'local' para autenticar.
 * Si el usuario es válido, genera un token JWT y devuelve info del usuario.
 * 
 * @param {Express.Request} req - Objeto solicitud.
 * @param {Express.Response} res - Objeto respuesta.
 * @param {Express.NextFunction} next - Middleware next.
 * @returns {Promise<void>}
 */
const login = async (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'El usuario o contraseña son incorrectos' });

    
      const token = jwt.generateToken({
      id: user.id,
      name: user.name,
      role: user.role,
      
    });

    return res.json({
      success:true,
      message: 'Authentication successful',
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });
  })(req, res, next);
};

/**
 * Controlador para registrar un nuevo usuario.
 * Recibe los datos por body y llama al servicio de creación.
 * Devuelve resultado o error.
 * 
 * @param {Express.Request} req - Objeto solicitud con datos del usuario en req.body.
 * @param {Express.Response} res - Objeto respuesta para enviar resultado o error.
 * @returns {Promise<void>}
 */
const register = async (req, res) => {
  try {
    const result = await authService.createUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error registering user:', error);
    
    // Manejar el error de usuario duplicado
    if (error.message === 'El usuario ya existe') {
      return res.status(409).json({ 
        success: false,
        message: 'El usuario ya existe',
        error: 'EMAIL_DUPLICATE'
      });
    }
    
    // Error genérico para otros casos
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
    login, register
};