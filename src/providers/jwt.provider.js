const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "SECRETO_SUPER_SEGURO";

/**
 * Genera un token JWT con un payload dado.
 * @param {Object} payload - Información que se incluirá en el token.
 * @returns {string} - Token JWT firmado.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: "2h" });
};

/**
 * Verifica y decodifica un token JWT.
 * @param {string} token - Token JWT a verificar.
 * @returns {Object} - Payload decodificado del token.
 * @throws {Error} - Si el token es inválido o expiró.
 */
const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
