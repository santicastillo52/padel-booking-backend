const courtScheduleProvider = require("../providers/courtsSchedules.providers");
const { Court, sequelize } = require("../models");


/**
 * Obtiene todos los horarios de canchas que cumplen con los filtros.
 *
 * @param {Object} [filters={}] - Filtros opcionales para la búsqueda.
 * @returns {Promise<Array<Object>>} - Lista de horarios que coinciden con los filtros.
 */
const fetchAllCourtsSchedules = async (filters = {}) => {
  return await courtScheduleProvider.getCourtsSchedulesFromDB(filters);
};

/**
 * Crea múltiples horarios para canchas dentro de una transacción, verificando solapamientos y validez.
 *
 * @param {Array<Object>} scheduleData - Array con datos de horarios a crear.
 * @param {string} id - ID de la cancha para la cual se crearán los horarios.
 * @param {string} scheduleData[].day_of_week - Día de la semana del horario.
 * @param {string} scheduleData[].start_time - Hora de inicio del horario (formato HH:mm:ss).
 * @param {string} scheduleData[].end_time - Hora de fin del horario (formato HH:mm:ss).
 *
 * @throws {Error} - Si `scheduleData` no es un array o está vacío.
 * @throws {Error} - Si la cancha con el `courtId` no existe.
 * @throws {Error} - Si `start_time` no es menor que `end_time`.
 * @throws {Error} - Si el horario se solapa con otro existente.
 *
 * @returns {Promise<Array<Object>>} - Lista de horarios creados exitosamente.
 */
const createCourtsSchedules = async (scheduleData, courtId, userId) => {
 

  if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
    throw new Error("scheduleData debe ser un array.");
  }

  const t = await sequelize.transaction();
  try {
  const createdSchedules = [];

   //Verificar que la cancha existe y pertenece al usuario
   const court = await Court.findByPk(courtId, {
    include: [{
      model: sequelize.models.Club,
      where: { UserId: userId }
    }]
  });

  if (!court) {
    throw new Error(`La cancha con ID: ${courtId} no existe o no te pertenece.`);
  }

  for (const schedule of scheduleData) {
    const { day_of_week, start_time, end_time } = schedule;

   

    if (start_time >= end_time) {
      throw new Error("start_time debe ser menor que end_time.");
    }

    const overlapping = await courtScheduleProvider.findOverlappingSchedule({
      courtId,
      day_of_week,
      start_time,
      end_time,
      transaction: t
    });

    if (overlapping.length > 0) {
      throw new Error(
        `El horario se solapa con uno ya existente (Cancha ID ${courtId}, Día ${day_of_week}, Horario ${start_time} - ${end_time})`
      );
    }
    
    const scheduleWithCourt = {
    ...schedule,
    courtId,
  };
    const newSchedule = await courtScheduleProvider.createCourtsSchedulesInDB(
      scheduleWithCourt, t
    );
    createdSchedules.push(newSchedule);
  }
  await t.commit();
  return createdSchedules;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * 
 * @param {number} id - ID del horario a eliminar.
 * @param {number} userId - ID del usuario que intenta eliminar el horario.
 * @throws {Error} - Si no se encuentra un horario con el ID proporcionado.
 * @throws {Error} - Si el horario no pertenece al usuario.
 * @returns {Promise<Object>} - Horario eliminado.
 */
const deleteCourtSchedule = async (id, userId) => {
  const schedule = await courtScheduleProvider.getCourtScheduleWithOwnership(id, userId);
  
  if (!schedule) {
    throw new Error(`No se encontró un horario con ID: ${id} o no te pertenece.`);
  }
  
  const deletedSchedule = await courtScheduleProvider.deleteCourtsSchedulesFromDB(id);
  if (!deletedSchedule) {
    throw new Error(`Error al eliminar el horario con ID: ${id}`);
  }
  return deletedSchedule;
}


module.exports = { fetchAllCourtsSchedules, createCourtsSchedules, deleteCourtSchedule };
