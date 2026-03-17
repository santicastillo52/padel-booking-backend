const { Club, Court, Image } = require("../models");
const { getClubIncludes } = require("../utils/queryHelpers");

const { Op } = require("sequelize");

/**
 * Obtiene una lista de clubes desde la base de datos, aplicando filtros opcionales.
 *
 * @param {Object} [filters={}] - Filtros para buscar clubes.
 * @param {string} [filters.name] - Filtro por nombre del club (búsqueda parcial).
 * @param {string} [filters.location] - Filtro por ubicación del club (búsqueda parcial).
 * @param {number} [filters.id] - Filtro por ID del club.
 *
 * @returns {Promise<Array<Object>>} - Lista de clubes que coinciden con los filtros, incluyendo sus canchas asociadas e imágenes.
 */

const getClubsFromDB = async (filters = {}) => {
  const where = {};

  if (filters.name) {
    where.name = { [Op.like]: `%${filters.name}%` };
  }

  if (filters.location) {
    where.location = { [Op.like]: `%${filters.location}%` };
  }

  if (filters.id) {
    where.id = filters.id;
  }

  return await Club.findAll({
    where,
    include: getClubIncludes(),
  });
};

/**
 * Obtiene un club específico de la base de datos por su ID.
 *
 * @param {number} id - ID del club a buscar.
 * @returns {Promise<Object>} - Club encontrado con sus canchas asociadas e imágenes.
 * @throws {Error} - Si no se encuentra el club.
 */

/**
 * Obtiene todos los clubes para el dropdown.
 *
 * @returns {Promise<Array<Object>>} - Lista de clubes para el dropdown.

*/

const getDropdownClubsFromDB = async () => {
  return await Club.findAll({
    attributes: ['id', 'name'],
  });
};


const getOneClubFromDB = async (id, transaction = null) => {
  const options = {
    where: { id },
    include: getClubIncludes(),
  };
  
  if (transaction) {
    options.transaction = transaction;
  }
  
  const club = await Club.findOne(options);

  if (!club) {
    throw new Error("Club not found");
  }

  return club;
};

/**
 * Obtiene el club asociado a un usuario específico por su ID.
 *
 * @param {number} id - ID del usuario dueño del club.
 * @returns {Promise<Object>} - Club del usuario con sus canchas asociadas e imágenes.
 * @throws {Error} - Si no se encuentra el club.
 */

const getMyClubFromDB = async (id) => {
  const club = await Club.findOne({
    where: { UserId: id },
    include: getClubIncludes(),
  });

  if (!club) {
    throw new Error("Club not found");
  }

  return club;
};


/**
 * Crea un nuevo club en la base de datos.
 *
 * @param {Object} clubData - Datos del nuevo club a crear.
 * @param {string} clubData.name - Nombre del club.
 * @param {string} clubData.location - Ubicación del club.
 * @param {number} clubData.UserId - ID del usuario propietario del club.
 *
 * @returns {Promise<Object>} - Club creado.
 */

const createClubInDB = async (clubData, transaction ) => {
 
  const newClub = await Club.create(clubData, {transaction});
  return newClub;
};

/**
 * Busca un club en la base de datos asociado a un usuario específico.
 *
 * @param {number} userId - ID del usuario.
 * @returns {Promise<Object|null>} - Club encontrado o `null` si no existe.
 */

const findClubByUserId = async (userId) => {
  return await Club.findOne({ where: { UserId: userId } });
};

/**
 * Obtiene todas las imágenes de un club y sus canchas
 *
 * @param {number} clubId - ID del club.
 * @returns {Promise<Object>} - Objeto con imágenes del club y de sus canchas.
 */
const getClubImages = async (clubId) => {
  const club = await Club.findByPk(clubId, {
    include: [
      {
        model: Image,
        where: { type: 'club' },
        required: false,
        attributes: ['id', 'url', 'type']
      }
    ]
  });

  const courts = await Court.findAll({
    where: { ClubId: clubId },
    include: [
      {
        model: Image,
        where: { type: 'court' },
        required: false,
        attributes: ['id', 'url', 'type']
      }
    ]
  });

  return {
    clubImages: club?.Images || [],
    courtImages: courts.flatMap(court => court.Images || [])
  };
};

module.exports = {
  getClubsFromDB,
  getDropdownClubsFromDB,
  getOneClubFromDB,
  getMyClubFromDB,
  createClubInDB,
  findClubByUserId,
  getClubImages,
};
