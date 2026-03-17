
const rateLimit = require('express-rate-limit');

// Rate limiter específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por ventana
  message: {
    success: false,
    message: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.',
    error: 'TOO_MANY_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Opcional: usar Redis para múltiples servidores
  // store: new RedisStore({...})
});

module.exports = {
    loginLimiter
}