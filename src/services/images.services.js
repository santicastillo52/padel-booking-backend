const imageProvider = require("../providers/images.providers");
const courtProvider = require("../providers/courts.providers");
const clubProvider = require("../providers/clubs.providers");
const cloudinary = require("../config/cloudinary");

const CLOUDINARY_FOLDERS = {
  club: "padel/clubs",
  court: "padel/courts",
};

/**
 * Sube un archivo buffer de Multer a Cloudinary
 * @param {Object} file - Archivo Multer con buffer
 * @param {string} folder - Carpeta destino en Cloudinary
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
    stream.end(file.buffer);
  });
};

/**
 * Elimina un asset de Cloudinary por su public_id
 * @param {string} publicId - public_id del asset en Cloudinary
 * @returns {Promise<void>}
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn(
      `No se pudo eliminar asset de Cloudinary (${publicId}):`,
      error.message
    );
  }
};

/**
 * Obtiene todas las imágenes de la base de datos
 * @returns {Promise<Array>} - Lista de todas las imágenes
 * @throws {Error} - Si ocurre un error al obtener las imágenes
 */
const fetchAllImages = async () => {
  const images = await imageProvider.getImagesFromDb();
  return images;
};

/**
 * Actualiza una imagen existente en la base de datos
 * @param {Object} imageData - Datos de la imagen a actualizar
 * @param {number} imageData.id - ID de la imagen
 * @param {string} imageData.url - Nueva URL de la imagen
 * @param {string} imageData.type - Tipo de imagen ('court' o 'club')
 * @param {number} imageId - ID de la imagen a actualizar
 * @returns {Promise<Object>} - Imagen actualizada
 * @throws {Error} - Si la imagen no existe o ocurre un error al actualizar
 */
const handleUpdate = async (imageData, imageId) => {
  const image = await imageProvider.getImageByIdFromDB(imageId);
  if (!image) {
    throw new Error(`La imagen con id ${imageId} no existe`);
  }
  await imageProvider.deleteImage(imageId);
  const updatedImage = await imageProvider.updateImage(imageData);
  return updatedImage;
};

/**
 * Actualiza una imagen existente con un nuevo archivo en Cloudinary
 * @param {number} imageId - ID de la imagen a actualizar
 * @param {Object} file - Nuevo archivo de imagen (Multer)
 * @returns {Promise<Object>} - Imagen actualizada
 * @throws {Error} - Si la imagen no existe o ocurre un error al actualizar
 */
const handleImageUpdate = async (imageId, file) => {
  const existingImage = await imageProvider.getImageByIdFromDB(imageId);
  if (!existingImage) {
    throw new Error(`La imagen con id ${imageId} no existe`);
  }

  if (!file) {
    throw new Error("No se ha proporcionado ningún archivo");
  }

  const folder = CLOUDINARY_FOLDERS[existingImage.type];
  let uploadResult;

  try {
    uploadResult = await uploadToCloudinary(file, folder);

    await imageProvider.updateImage({
      id: imageId,
      url: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
    });

    if (existingImage.cloudinaryPublicId) {
      await deleteFromCloudinary(existingImage.cloudinaryPublicId);
    }

    return await imageProvider.getImageByIdFromDB(imageId);
  } catch (error) {
    if (uploadResult?.public_id) {
      await deleteFromCloudinary(uploadResult.public_id);
    }
    throw error;
  }
};

/**
 * Sube una nueva imagen a Cloudinary y la asocia a una entidad (cancha o club)
 * @param {Object} courtData - Datos de la imagen y entidad
 * @param {Object} courtData.file - Archivo Multer con buffer
 * @param {string} courtData.type - Tipo de entidad ('court' o 'club')
 * @param {number} [courtData.courtId] - ID de la cancha (requerido si type es 'court')
 * @param {number} [courtData.clubId] - ID del club (requerido si type es 'club')
 * @param {Object} transaction - Transacción Sequelize para la operación
 * @returns {Promise<Object>} - Imagen creada
 * @throws {Error} - Si no se proporciona archivo, tipo inválido, o entidad no existe
 */
const handleUpload = async (courtData, transaction) => {
  const { type, courtId, clubId } = courtData;

  if (!courtData.file) {
    throw new Error("No se ha proporcionado ningún archivo");
  }

  if (!type || !["court", "club"].includes(type)) {
    throw new Error('El tipo debe ser "court" o "club"');
  }

  if (type === "court") {
    if (!courtId) {
      throw new Error("CourtId es requerido para imágenes de cancha");
    }
    if (clubId) {
      throw new Error("Una imagen de cancha no puede tener ClubId");
    }
  }

  if (type === "club") {
    if (!clubId) {
      throw new Error("ClubId es requerido para imágenes de club");
    }
    if (courtId) {
      throw new Error("Una imagen de club no puede tener CourtId");
    }
  }

  if (type === "court") {
    const courtExists = await courtProvider.getCourtByIdFromDB(
      courtId,
      transaction
    );
    if (!courtExists) {
      throw new Error(`La cancha con id ${courtId} no existe`);
    }
  }

  if (type === "club") {
    const clubExists = await clubProvider.getOneClubFromDB(clubId, transaction);
    if (!clubExists) {
      throw new Error(`El club con id ${clubId} no existe`);
    }
  }

  const folder = CLOUDINARY_FOLDERS[type];
  let uploadResult;

  try {
    uploadResult = await uploadToCloudinary(courtData.file, folder);

    const imageData = {
      url: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      type,
      CourtId: type === "court" ? courtId : null,
      ClubId: type === "club" ? clubId : null,
    };

    const newImage = await imageProvider.createImage(imageData, { transaction });
    return newImage;
  } catch (error) {
    if (uploadResult?.public_id) {
      await deleteFromCloudinary(uploadResult.public_id);
    }
    throw error;
  }
};

module.exports = {
  fetchAllImages,
  handleUpload,
  handleUpdate,
  handleImageUpdate,
  deleteFromCloudinary,
};
