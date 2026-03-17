const { User, Club } = require("../models");
const { Op } = require("sequelize");

/**
 * Busca usuarios que coincidan con los filtros.
 * @param {Object} [filters={}] - Filtros opcionales.
 * @param {string} [filters.name] - Nombre o parte del nombre.
 * @param {string} [filters.email] - Email o parte del email.
 * @returns {Promise<Array<Object>>} - Usuarios encontrados.
 */

const getUsersFromDB = async (filters = {}) => {
  const where = {};

  if (filters.name) {
    where.name = { [Op.like]: `%${filters.name}%` };
  }

  if (filters.email) {
    where.email = { [Op.like]: `%${filters.email}%` };
  }

  return await User.findAll({ where });
};

/**
 * Obtiene un usuario por su ID, incluyendo el ID de su club.
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<Object|null>} - Usuario encontrado con su club o null si no existe.
 */

const getUserByIdFromDB = async (userId) => {
  return await User.findByPk(userId, {
    include: {
      model: Club,
      attributes: ["id"],
    },
  });
};

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {Object} userData - Datos del usuario a crear.
 * @returns {Promise<Object>} - Usuario creado.
 */
const createUserInDB = async (userData) => {
  return await User.create(userData);
};

/**
 * Actualiza un usuario existente.
 * @param {number|string} userId - ID del usuario a actualizar.
 * @param {Object} userData - Datos para actualizar.
 * @returns {Promise<Object>} - Usuario actualizado.
 * @throws {Error} - Si el usuario no existe.
 */

const updateUserInDB = async (userId, userData) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return await user.update(userData);
};

module.exports = {
  getUsersFromDB,
  getUserByIdFromDB,
  createUserInDB,
  updateUserInDB,
};
