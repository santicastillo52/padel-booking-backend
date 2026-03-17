const imageService = require('../services/images.services');


const getAllImages = async (req, res) => {
  try {
    const images = await imageService.fetchAllImages();
    res.status(200).json({
      success: true,
      message: 'Imagenes obtenidas correctamente.',
      data: images
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error al obtener las imagenes',
      error: 'IMAGE_FETCH_ERROR'
    });
  }
};


const uploadImage = async (req, res) => {
  const courtData = req.file;
  try {
    const response = await imageService.handleUpload(courtData);
    res.status(201).json({
      success: true,
      message: 'Imagen subida correctamente.',
      data: response
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error al subir la imagen',
      error: 'IMAGE_UPLOAD_ERROR'
    });
  }
};


const updateImage = async (req, res) => {
  const imageId = req.params.id;
  const file = req.file;
  try {
    const response = await imageService.handleImageUpdate(imageId, file);
    res.status(200).json({
      success: true,
      message: 'Imagen actualizada correctamente.',
      data: response
    });
  }
  catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error al actualizar la imagen',
      error: 'IMAGE_UPDATE_ERROR'
    });
  }
};

module.exports = {
  getAllImages, 
  updateImage, 
  uploadImage,
};
