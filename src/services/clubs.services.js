const clubProvider = require("../providers/clubs.providers");
const imageService = require("./images.services");
const fs = require('fs').promises;
const path = require('path');
const sequelize = require('../config/database');

/**
 * Obtiene todos los clubes que coinciden con los filtros proporcionados.
 *
 * @param {Object} filters - Filtros para buscar clubes (por ejemplo, nombre, ubicación o ID).
 * @returns {Promise<Array<Object>>} - Lista de clubes que coinciden con los filtros.
 */

const fetchAllClubs = async (filters) => {
  return await clubProvider.getClubsFromDB(filters);
};

/**
 * Obtiene todos los clubes para el dropdown.
 *
 * @returns {Promise<Array<Object>>} - Lista de clubes para el dropdown.
 */


const fetchDropdownClubs = async () => {
  return await clubProvider.getDropdownClubsFromDB();
};
/**
 * Obtiene un club específico por su ID.
 *
 * @param {number} id - ID del club a buscar.
 * @returns {Promise<Object>} - Club encontrado.
 * @throws {Error} - Si no se encuentra el club.
 */

const fetchOneClub = async (id) => {
  const club = await clubProvider.getOneClubFromDB(id);
  if(club){
    return club
  } else {
    throw new Error('No se encontro club.');
  }
};
/**
 * Obtiene el club asociado a un usuario específico.
 *
 * @param {number} id - ID del usuario.
 * @returns {Promise<Object>} - Club del usuario.
 * @throws {Error} - Si no se encuentra el club.
 */

const fetchMyClub = async (id) => {
  const club = await clubProvider.getMyClubFromDB(id);
  if(club){
    return club
  } else {
    throw new Error('No se encontro club.');
  }
};

/**
 * Crea un nuevo club en la base de datos.
 *
 * @param {Object} clubData - Datos del club a crear.
 * @param {string} clubData.name - Nombre del club.
 * @param {string} clubData.location - Ubicación del club.
 * @param {number} clubData.UserId - ID del usuario dueño del club.
 * @param {file} file - imagen del club.
 *
 * @returns {Promise<Object>} - Club creado exitosamente.
 * @throws {Error} - Si el usuario ya tiene un club registrado.
 */


const createClub = async (clubData, file) => {
  const t = await sequelize.transaction();
  
  // Generar filename UNA SOLA VEZ (antes del try)
  const filename = `${Date.now()}_${file.originalname}`;
  const filePath = path.join(__dirname, '../../uploads', filename);
  
  try {
    const userId = parseInt(clubData.UserId);
    const existingClub = await clubProvider.findClubByUserId(userId);
    if (existingClub) {
      throw new Error("Este usuario ya tiene un club");
    }

    // Crear club en BD con transacción
    const newClub = await clubProvider.createClubInDB(clubData, t);

    // Guardar archivo físico
    await fs.writeFile(filePath, file.buffer);

    // Crear registro de imagen en BD con transacción
    const imageData = {
      file: { filename },
      type: 'club',
      clubId: newClub.id
    };
    await imageService.handleUpload(imageData, t);

    // Confirmar transacción
    await t.commit();

    return newClub;

  } catch (error) {
    // Cancelar transacción
    await t.rollback();
    
    // Limpiar archivo físico si se guardó
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error('Error eliminando archivo después de rollback:', unlinkError);
    }
    
    throw error;
  }
};

module.exports = { fetchAllClubs, fetchDropdownClubs, fetchOneClub, fetchMyClub, createClub };
