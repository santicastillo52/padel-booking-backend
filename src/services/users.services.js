const userProvider = require('../providers/users.providers');

/**
 * Obtiene todos los usuarios que coinciden con los filtros.
 * @param {Object} filters - Filtros para buscar usuarios.
 * @returns {Promise<Array<Object>>} - Lista de usuarios encontrados.
 */

fetchAllUsers = async (filters) => {
    return await userProvider.getUsersFromDB(filters);
}

/**
 * Obtiene un usuario por su ID.
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<Object|null>} - Usuario encontrado o null si no existe.
 */

fetchUserById = async (userId) => {
    const user = await userProvider.getUserByIdFromDB(userId);
    if(user){
        return user
    } else {
        throw new Error('No se encontro usuario.');
    }
}

/**
 * Actualiza los datos de un usuario.
 * @param {number|string} userId - ID del usuario.
 * @param {Object} userData - Datos para actualizar.
 * @returns {Promise<Object>} - Usuario actualizado.
 * @throws {Error} - Si el usuario no existe.
 */

updateUser = async (userId, userData) => {
    return await userProvider.updateUserInDB(userId, userData);
};

module.exports = { fetchAllUsers, fetchUserById, updateUser };