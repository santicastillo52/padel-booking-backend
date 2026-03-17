const courtsProvider = require("../providers/courts.providers");
const imageService = require("./images.services");
const courtHelpers = require("../utils/courtHelpers");
const {DateTime} = require("luxon");
const { sequelize, Court } = require("../models");
const fs = require('fs').promises;
const path = require('path');

const fetchAllCourts = async (filters) => {
  return await courtsProvider.getCourtsFromDB(filters);
};



/**
 * Obtiene canchas disponibles según los filtros enviados (todos opcionales).
 * Devuelve horarios desde la hora actual de hoy hasta el día anterior de la próxima semana.
 * Para hoy solo devuelve horarios que no hayan pasado la hora actual.
 *
 * @param {Object} filters - Filtros para buscar canchas disponibles.
 * @param {string} [filters.day_of_week] - Día de la semana (en inglés, ej: 'monday').
 * @param {string} [filters.start_time] - Hora de inicio (formato HH:mm:ss).
 * @param {string} [filters.end_time] - Hora de fin (formato HH:mm:ss).
 * @param {number} [filters.clubId] - ID del club (opcional).
 * @returns {Promise<Array<Object>>} - Lista de canchas disponibles con sus horarios próximos.
 * @throws {Error} Si no se encontraron canchas disponibles en el período especificado.
 * 
 * @example
 * // Obtener todas las canchas disponibles
 * const courts = await fetchAvailableCourts({});
 * 
 * // Obtener canchas de un club específico
 * const courts = await fetchAvailableCourts({ clubId: 1 });
 * 
 * // Obtener canchas disponibles para lunes
 * const courts = await fetchAvailableCourts({ day_of_week: 'monday' });
 */
const fetchAvailableCourts = async (filters) => {
  const availableCourts = await courtsProvider.getAvailableCourtsFromDB(filters);

  const dayMapping = {
    'sunday': 7, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
  };

  // Obtener fecha actual en zona horaria de Argentina
  const today = DateTime.now().setZone('America/Argentina/Buenos_Aires');
  const todayStart = today.startOf('day');
  const todayWeekday = today.weekday; // Luxon usa 1-7 (lunes=1, domingo=7)
  
  
  // Calcular el día anterior de la próxima semana (mismo día de la semana que hoy, pero de la próxima semana)
  const nextWeekSameDay = today.plus({ weeks: 1 });
  const endDate = nextWeekSameDay.minus({ days: 1 }); // Un día antes
  

  const enrichedCourts = availableCourts.map(court => {
    const schedules = court.CourtSchedules
      .map(schedule => {
        const targetWeekday = dayMapping[schedule.day_of_week];
        let nextDate;
        let isPast = false;
        
        // Si el horario es para hoy, usar la fecha actual
        if (targetWeekday === todayWeekday) {
          nextDate = today.toISODate();
          // Verificar si ya pasó la hora
          const startDateTime = DateTime.fromISO(`${nextDate}T${schedule.start_time}`, { zone: 'America/Argentina/Buenos_Aires' });
          if (today > startDateTime) {
            isPast = true;
          }
        } else {
          // Para otros días, calcular la próxima fecha
          nextDate = courtHelpers.getNextDateForWeekday(targetWeekday, today);
        }
        
        return {
          ...schedule.dataValues,
          date: nextDate,
          isPast
        };
      })
      .filter(schedule => {
        // Solo mostrar horarios desde hoy hasta el día anterior de la próxima semana y que no sean pasados
        const scheduleDate = DateTime.fromISO(schedule.date, { zone: 'America/Argentina/Buenos_Aires' });
        return !schedule.isPast && scheduleDate >= todayStart && scheduleDate <= endDate;
      });
    return {
      ...court.dataValues,
      CourtSchedules: schedules
    };
  }).filter(court => court.CourtSchedules.length > 0);

  if (enrichedCourts.length === 0) {
    throw new Error(`No se encontraron canchas disponibles`);
  }

  return enrichedCourts;
};

/**
 * Devuelve una cancha específica por su ID.
 * @param {number} courtId 
 * @returns {Promise<Object>} - Objeto que representa la cancha encontrada.
 */
const fetchCourtById = async (courtId) => {
 const court = await courtsProvider.getCourtByIdFromDB(courtId);
  if (!court) {
   throw new Error(`No se encontró la cancha con ID ${courtId}`);
   
  }
  return court;
}

/**
 * Agrega una nueva cancha a la base de datos.
 *
 * @param {Object} courtData - Objeto que representa la cancha a agregar.
 * @param {string} courtData.name - Nombre de la cancha.
 * @param {number} courtData.clubId - ID del club al que pertenece la cancha.
 * @param {string} courtData.court_type - Tipo de cancha ("outdoor" o "indoor").
 * @param {string} courtData.wall_type - Tipo de pared ("cement" o "acrylic").
 * @param {Array<Object>} courtData.schedules - Horarios disponibles para la cancha.
 * @param {string} courtData.schedules[].day_of_week - Día de la semana del horario.
 * @param {string} courtData.schedules[].start_time - Hora de inicio en formato HH:mm:ss.
 * @param {string} courtData.schedules[].end_time - Hora de fin en formato HH:mm:ss.
 * @param {Object} file - Archivo de imagen opcional para la cancha.
 *
 * @returns {Promise<Object>} - Cancha creada exitosamente.
 * @throws {Error} Si ya existe una cancha con el mismo nombre en el club especificado.
 * @throws {Error} Si ocurre un error al crear una cancha en la base de datos.
 */

const addNewCourts = async (courtList, files, userId) => {
  const t = await sequelize.transaction();
  let uploadedFilePaths = [];

  try {
    const createdCourts = [];

    for (let i = 0; i < courtList.length; i++) {
      const courtData = courtList[i];
      const file = files[i]; // Obtener el archivo correspondiente
      
      // La verificación de propiedad del club ya se hizo en el middleware
      
      const existingCourt = await Court.findOne({
        where: {
          name: courtData.name,
          clubId: courtData.clubId,
        },
        transaction: t,
      });

      if (existingCourt) {
        throw new Error(
          `Ya existe una cancha con el nombre "${courtData.name}" en el club.`
        );
      }
      const court = await courtsProvider.createCourtInDB(courtData, t);
      
      if (file) {
        // Subir archivo solo si la transacción es exitosa
        const filename = `${Date.now()}_${file.originalname}`;
        const filePath = path.join(__dirname, '../../uploads', filename);
        
        await fs.writeFile(filePath, file.buffer);
        uploadedFilePaths.push(filePath);
        
        const mockReq = {
          file: { filename },
          type: 'court',
          courtId: court.id
        };
        await imageService.handleUpload(mockReq, t);
      }
    
      createdCourts.push(court);
    }

    await t.commit();
    return createdCourts;
  } catch (error) {
    // Si hay error, eliminar los archivos si se subieron
    for (const filePath of uploadedFilePaths) {
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    await t.rollback();
    throw error;
  }
};
/**
 * 
 * @param {number} courtId - Id de la cancha
 * @param {Array} courtData - Atributos a cambiar
 * @returns {Promise<Object>} - Cancha modificada
 * @throws {Error} Si ocurre un error al crear una cancha en la base de datos.
 */
 
const editCourt = async (courtId, courtData) => {
  const currentCourt = await courtsProvider.getCourtByIdFromDB(courtId);
  
  if (!currentCourt) {
    throw new Error(`No se encontró la cancha con ID ${courtId}`);
  }
  
  const existingCourt = await courtsProvider.findCourtByNameExcludingId(
    courtData.name, 
    currentCourt.clubId, 
    courtId
  );
  
  if (existingCourt) {
    throw new Error(`Ya existe una cancha con el nombre ${courtData.name} en este club`);
  }
  
  const updatedCourt = await courtsProvider.putCourtByIdFromDB(courtId, courtData);
  
  return updatedCourt;
}

/**
 * 
 * @param {number} courtId - Id de la cancha
 * @returns {promise<Object>} - Cancha eliminada
 * @throws {error} - Si ocurre un error al eliminar la cancha en la base de datos
 */
const deleteCourt =  async (courtId) => {
  const deletedCourt = await courtsProvider.deleteCourtFromDb(courtId);

  return deletedCourt;
 } 


 
module.exports = { 
  fetchAllCourts, 
  addNewCourts, 
  fetchCourtById, 
  editCourt, 
  deleteCourt,
  fetchAvailableCourts
};
