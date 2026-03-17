const bookingsProvider = require("../providers/bookings.providers");
const courtScheduleProvider = require("../providers/courtsSchedules.providers");
const { Club } = require("../models");
const { DateTime } = require('luxon');

/**
 * Obtiene una lista de reservas desde la base de datos, aplicando filtros opcionales.
 *
 * @param {Object} filters - Filtros para buscar reservas (ej. por usuario, cancha, fecha, etc.).
 * @returns {Promise<Array<Object>>} - Lista de reservas que coinciden con los filtros.
 */

const fetchAllBookings = async (id, role, status) => {
  try {
    if (role === 'admin') {
      const club = await Club.findOne({
        where: { UserId: id }, 
        attributes: ['id']
      });
      
      if (!club) {
        throw new Error("No se encontró el club asociado al administrador");
      }
      
      return await bookingsProvider.getBookingsFromDB({ id: club.id, status, role });
    }
    
    return await bookingsProvider.getBookingsFromDB({ id, status, role });
    
  } catch (error) {
    throw new Error(`Error fetching bookings: ${error.message}`);
  }
};

/**
 * Agrega una nueva reserva a la base de datos.
 *
 * @param {Object} bookingData - Datos de la reserva que se desea agregar.
 * @param {number} bookingData.courtId - ID de la cancha.
 * @param {number} bookingData.courtScheduleId - ID del horario de la cancha.
 * @param {string} bookingData.date - Fecha de la reserva (formato YYYY-MM-DD).
 * @param {number} bookingData.userId - ID del usuario que realiza la reserva.
 *
 * @returns {Promise<Object>} - Reserva creada exitosamente.
 *
 * @throws {Error} - Si no se encuentra el horario de cancha.
 * @throws {Error} - Si la cancha ya está reservada o en mantenimiento.
 * @throws {Error} - Si ya existe una reserva en ese horario y fecha.
 * @throws {Error} - Si ocurre un error al crear la reserva.
 */

const addBooking = async (bookingData, userId) => {
  try {
    const courtSchedule = await courtScheduleProvider.getOneCourtScheduleFromDB(
      bookingData
    );
    if (!courtSchedule) {
      throw new Error("No se encontró el horario de cancha.");
    }
    if (courtSchedule.status === "booked") {
      throw new Error("La cancha no esta disponible.");
    }
    if (courtSchedule.status === "maintenance") {
      throw new Error("La cancha esta en mantenimiento.");
    }
    const existingBooking =
      await bookingsProvider.getBookingsFromDB({
        courtScheduleId: bookingData.courtScheduleId,
        date: bookingData.date,
        single: true
      });

    if (existingBooking && (existingBooking.status === 'pending' || existingBooking.status === 'confirmed')) {
      throw new Error("Ya existe una reserva para ese horario y fecha.");
    }



    const completedBookingData = {
      ...bookingData,
      userId: userId
    }

    const newBooking = await bookingsProvider.createBookingInDB(completedBookingData);
    
    await courtScheduleProvider.updateCourtScheduleStatusInDB(
      bookingData.courtScheduleId,
      "booked"
    );
    
    return newBooking;
  } catch (error) {
    throw new Error("Error creating booking: ", error.message);
  }
};

/**
 * Actualiza el estado de una reserva existente.
 *
 * @param {number} bookingId - ID de la reserva a actualizar.
 * @param {string} status - Nuevo estado de la reserva ('pending', 'confirmed', 'cancelled', 'completed').
 * @param {string} userRole - Rol del usuario que realiza la actualización ('admin' o 'client').
 *
 * @returns {Promise<Object>} - Reserva actualizada exitosamente.
 *
 * @throws {Error} - Si el cliente intenta cancelar con menos de 12 horas de anticipación.
 * @throws {Error} - Si ocurre un error al actualizar el estado de la reserva.
 */
const updateBookingStatus = async (bookingId, status, userRole) => {
  if(status === 'cancelled' && userRole === "client"){
    const booking = await bookingsProvider.getBookingsFromDB({ 
      bookingId, 
      single: true 
    });
    const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');
    const bookingDateTime = DateTime.fromISO(
      `${booking.date}T${booking.CourtSchedule.start_time}`,
      { zone: 'America/Argentina/Buenos_Aires' }
    );
    
    const hoursUntilBooking = bookingDateTime.diff(now, 'hours').hours;
    
    if (hoursUntilBooking < 12) {
      throw new Error(`No puedes cancelar la reserva. Faltan ${Math.round(hoursUntilBooking)} horas. El límite mínimo es de 12 horas.`);
    }
  }
  
  const updatedBooking = await bookingsProvider.updateBookingStatusInDB(bookingId, status);

 // Solo liberar courtSchedule si se cancela la reserva
 if (status === 'cancelled') {
  await courtScheduleProvider.updateCourtScheduleStatusInDB(
    updatedBooking.courtScheduleId, 
    "available"
  );
}
  
  return updatedBooking;
};


/**
 * Elimina una reserva de la base de datos.
 *
 * @param {number} bookingId - ID de la reserva a eliminar.
 *
 * @returns {Promise<Object>} - Datos de la reserva eliminada.
 *
 * @throws {Error} - Si la reserva no existe.
 * @throws {Error} - Si la reserva no está en estado 'completed' (solo las reservas completadas pueden eliminarse).
 * @throws {Error} - Si ocurre un error al eliminar la reserva.
 */
const deleteBooking = async (bookingId) => {
  const bookingToDelete = await bookingsProvider.getBookingsFromDB({ 
    bookingId, 
    single: true 
  });

  if (!bookingToDelete) {
    throw new Error("Booking not found");
  }

  if (bookingToDelete.status !== "completed") {
    throw new Error("Solo las reservas completadas pueden eliminarse.");
  }

  await bookingsProvider.deleteBookingInDB(bookingId);

  await courtScheduleProvider.updateCourtScheduleStatusInDB(
    bookingToDelete.courtScheduleId,
    "available"
  );

  return bookingToDelete;
};


module.exports = { fetchAllBookings, addBooking, updateBookingStatus, deleteBooking};
