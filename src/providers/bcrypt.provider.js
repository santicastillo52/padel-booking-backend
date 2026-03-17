const bcrypt = require("bcrypt");

/**
 * Hashea una contraseña utilizando bcrypt.
 * @param {string} password - Contraseña en texto plano.
 * @returns {Promise<string>} - Contraseña hasheada.
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compara una contraseña en texto plano con un hash bcrypt.
 * @param {string} password - Contraseña en texto plano.
 * @param {string} hashed - Contraseña hasheada para comparar.
 * @returns {Promise<boolean>} - True si coinciden, false si no.
 */
const comparePassword = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};

module.exports = {
  hashPassword,
  comparePassword,
};
