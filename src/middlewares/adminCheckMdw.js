const { Club, Court, CourtSchedule, Image } = require('../models');


const ownerCheck = (req, res, next) => {
  if (req.user.role === 'client') {
      return res.status(403).json({ 
          message: 'Solo los propietarios pueden acceder a esta funcionalidad' 
      });
  }
  next();
};

const checkClubOwnership = async (req, res, next) => {
  const authenticatedUserId = req.user.id;        
  const clubId = parseInt(req.params.id);     
  

  const club = await Club.findOne({
    where: { id: clubId, UserId: authenticatedUserId }
  });
  
  if (!club) {
    return res.status(403).json({ 
      message: 'No puedes editar este club',
      error: 'FORBIDDEN_ACCESS'
    });
  }
  
  next();
};


const checkCourtOwnership = async (req, res, next) => {
  const authenticatedUserId = req.user.id;        
  const courtId = parseInt(req.params.id);      
  
  const court = await Court.findByPk(courtId, {
    include: [{ model: Club, required: true, where: { UserId: authenticatedUserId } }]
  });
  
  if (!court) {
    return res.status(403).json({ 
      message: 'No puedes editar esta cancha',
      error: 'FORBIDDEN_ACCESS'
    });
  }
  
  next();
};
  
const checkClubOwnershipForCourts = async (req, res, next) => {
  const authenticatedUserId = req.user.id;
  let courts = [];
  
  // Verificar que req.body existe
  if (!req.body) {
    return res.status(400).json({ 
      success: false,
      message: 'No se recibieron datos en el cuerpo de la petición',
      error: 'VALIDATION_ERROR'
    });
  }
  
  // Extraer las canchas del body
  if (req.body.courts && Array.isArray(req.body.courts)) {
    courts = req.body.courts;
  } else {
    // Procesar campos con índices (formato plano) solo si req.body existe
    Object.keys(req.body).forEach(key => {
      const match = key.match(/courts\[(\d+)\]\[(\w+)\]/);
      if (match) {
        const [, index, field] = match;
        if (!courts[index]) courts[index] = {};
        courts[index][field] = req.body[key];
      }
    });
  }
  
  if (courts.length === 0) {
    return res.status(400).json({ 
      message: 'No se enviaron canchas para crear',
      error: 'VALIDATION_ERROR'
    });
  }
  
  // Obtener todos los clubIds
  const clubIds = courts.map(court => parseInt(court.clubId));
  
  // Verificar que todos sean iguales
  const uniqueClubIds = [...new Set(clubIds)];
  if (uniqueClubIds.length > 1) {
    return res.status(400).json({ 
      message: 'Todas las canchas deben pertenecer al mismo club',
      error: 'VALIDATION_ERROR'
    });
  }
  
  // Verificar que el usuario sea dueño del club
  const clubId = uniqueClubIds[0];
  const club = await Club.findOne({
    where: { id: clubId, UserId: authenticatedUserId }
  });
  
  if (!club) {
    return res.status(403).json({ 
      message: 'No tienes permisos para crear canchas en este club',
      error: 'FORBIDDEN_ACCESS'
    });
  }
  
  // Pasar las canchas procesadas al controller para evitar duplicación
  req.processedCourts = courts;
  
  next();
};

const checkScheduleOwnership = async (req, res, next) => {
  const authenticatedUserId = req.user.id;        
  const scheduleId = parseInt(req.params.id);      
  
  const schedule = await CourtSchedule.findByPk(scheduleId, {
    include: [{
      model: Court,
      required: true, 
      include: [{
        model: Club,
        required: true,  
        where: { UserId: authenticatedUserId }
      }]
    }]
  });
  
  if (!schedule) {
    return res.status(403).json({ 
      message: 'No puedes eliminar este horario',
      error: 'FORBIDDEN_ACCESS'
    });
  }
  
  next();
};

const checkImageOwnership = async (req, res, next) => {
  const authenticatedUserId = req.user.id;
  const imageId = parseInt(req.params.id);
  
  try {
    const image = await Image.findByPk(imageId);
    
    if (!image) {
      return res.status(404).json({ 
        message: 'Imagen no encontrada',
        error: 'RESOURCE_NOT_FOUND'
      });
    }
    
    // Verificar propiedad según el tipo de imagen
    if (image.type === 'club' && image.ClubId) {
      const club = await Club.findOne({
        where: { id: image.ClubId, UserId: authenticatedUserId }
      });
      
      if (!club) {
        return res.status(403).json({ 
          message: 'No puedes editar esta imagen del club',
          error: 'FORBIDDEN_ACCESS'
        });
      }
    } else if (image.type === 'court' && image.CourtId) {
      const court = await Court.findByPk(image.CourtId, {
        include: [{ model: Club, where: { UserId: authenticatedUserId } }]
      });
      
      if (!court) {
        return res.status(403).json({ 
          message: 'No puedes editar esta imagen de la cancha',
          error: 'FORBIDDEN_ACCESS'
        });
      }
    } else {
      return res.status(400).json({ 
        message: 'Imagen sin asociación válida',
        error: 'INVALID_ASSOCIATION'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al verificar propiedad de la imagen',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

module.exports = { ownerCheck, checkClubOwnership, checkCourtOwnership, checkClubOwnershipForCourts, checkScheduleOwnership,checkImageOwnership }