const { Image } = require('../models');

/**
 * Obtiene todas las imágenes de la base de datos
 * @returns {Promise<Array>} - Lista de imágenes de la base de datos
 * @throws {Error} - Si ocurre un error al obtener las imágenes de la base de datos
 */
const getImagesFromDb = async () => { 
  return await Image.findAll();
};

/**
 * Obtiene una imagen específica por su ID desde la base de datos
 * @param {number} imageId - ID de la imagen a buscar
 * @returns {Promise<Object|null>} - Imagen encontrada o null si no existe
 * @throws {Error} - Si ocurre un error al buscar la imagen
 */
const getImageByIdFromDB = async (imageId) => {
  return await Image.findByPk(imageId);
};

/**
 * Crea una nueva imagen en la base de datos
 * @param {Object} data - Datos de la imagen a crear
 * @param {string} data.url - URL de la imagen
 * @param {string} data.type - Tipo de imagen ('court' o 'club')
 * @param {number} [data.CourtId] - ID de la cancha asociada (si type es 'court')
 * @param {number} [data.ClubId] - ID del club asociado (si type es 'club')
 * @param {Object} [options] - Opciones adicionales (ej: transaction)
 * @returns {Promise<Object>} - Imagen creada
 * @throws {Error} - Si ocurre un error al crear la imagen
 */
const createImage = async (data, options = {}) => {
  return await Image.create(data, options);
};

/**
 * Actualiza una imagen existente en la base de datos
 * @param {Object} imageData - Datos de la imagen a actualizar
 * @param {number} imageData.id - ID de la imagen a actualizar
 * @param {string} [imageData.url] - Nueva URL de la imagen
 * @param {string} [imageData.type] - Nuevo tipo de imagen
 * @returns {Promise<Array>} - Array con el número de filas afectadas
 * @throws {Error} - Si ocurre un error al actualizar la imagen
 */
const updateImage = async (imageData) => {
  return await Image.update(imageData, { where: { id: imageData.id } });
};

/**
 * Elimina una imagen de la base de datos
 * @param {number} imageId - ID de la imagen a eliminar
 * @returns {Promise<number>} - Número de filas eliminadas
 * @throws {Error} - Si ocurre un error al eliminar la imagen
 */
const deleteImage = async (imageId) => {
  return await Image.destroy({ where: { id: imageId } });
};

module.exports = { 
  getImagesFromDb, 
  createImage, 
  getImageByIdFromDB, 
  updateImage, 
  deleteImage 
};
