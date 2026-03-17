const { Booking, Club, Court, CourtSchedule, User } = require("../models");
/**
 * Función unificada para obtener reservas de la base de datos con diferentes filtros
 * @param {Object} options - Opciones de búsqueda
 * @param {number} [options.id] - ID del usuario o club (según el rol)
 * @param {string} [options.status] - Estado de la reserva
 * @param {string} [options.role] - Rol del usuario ('admin' o 'client')
 * @param {number} [options.bookingId] - ID específico de la reserva
 * @param {number} [options.courtScheduleId] - ID del horario de la cancha
 * @param {string} [options.date] - Fecha de la reserva
 * @param {boolean} [options.single] - Si es true, retorna un solo objeto; si es false, retorna array
 * @returns {Promise<Array|Object>} - Lista de reservas o reserva individual
 */
const getBookingsFromDB = async (options = {}) => {
  try {
    const {
      id,
      status,
      role,
      bookingId,
      courtScheduleId,
      date,
      single = false
    } = options;

    const include = [
      {
        model: CourtSchedule,
        attributes: ["id", "start_time", "end_time", "day_of_week"],
      },
      {
        model: Court,
        attributes: ["id", "name"],
        include: [
          {
            model: Club,
            attributes: ["id", "name"],
          }
        ]
      },
      {
        model: User,
        attributes: ["id", "name", "last_name", "email"],
      }
    ];

    let whereClause = {};

    // Si se busca por ID específico de booking
    if (bookingId) {
      whereClause.id = bookingId;
    }
    // Si se busca por schedule y fecha
    else if (courtScheduleId && date) {
      whereClause.courtScheduleId = courtScheduleId;
      whereClause.date = date;
    }
    // Si se busca por rol y estado (caso original)
    else if (id && status && role) {
      whereClause = role === 'admin' 
        ? { clubId: id, status: status } 
        : { userId: id, status: status };
    }
    // Si solo se busca por estado
    else if (status) {
      whereClause.status = status;
    }

    const queryOptions = { 
      where: whereClause, 
      include 
    };

    // Si single es true, usar findOne; si es false, usar findAll
    const result = single 
      ? await Booking.findOne(queryOptions)
      : await Booking.findAll(queryOptions);

    return result;
  } catch (error) {
    throw new Error("Error getting bookings: " + error.message);
  }
};

/**
 * Crea una nueva reserva en la base de datos.
 *
 * @param {Object} bookingData - Datos de la reserva a crear.
 * @param {number} bookingData.courtId - ID de la cancha.
 * @param {number} bookingData.courtScheduleId - ID del horario de la cancha.
 * @param {string} bookingData.date - Fecha de la reserva (formato YYYY-MM-DD).
 * @param {number} bookingData.userId - ID del usuario que realiza la reserva.
 *
 * @returns {Promise<Object>} - Reserva creada exitosamente.
 * @throws {Error} - Si ocurre un error al guardar la reserva en la base de datos.
 */

const createBookingInDB = async (bookingData) => {
  try {
    const newBooking = await Booking.create(bookingData);
    return newBooking;
  } catch (error) {
    throw new Error("Error creating booking: " + error.message);
  }
};

/**
 * Actualiza el estado de una reserva en la base de datos.
 * @param {*} bookingId- Id de la reserva a actualizar.
 *  @param {*} status- Datos de la reserva a actualizar.
 * @returns {Promise<Object>} - Reserva actualizada exitosamente.
 * @throws {Error} - Si ocurre un error al actualizar el estado de la reserva en la base de datos.
 */

const updateBookingStatusInDB = async (bookingId, status) => {
  try {
    const bookingToUpdate = await Booking.findByPk(bookingId);
    if (!bookingToUpdate) {
      throw new Error("Booking not found");
    }
    bookingToUpdate.status = status;
    await bookingToUpdate.save();
    return bookingToUpdate;
  } catch (error) {
    throw new Error("Error updating booking status: ", error.message);
  }
};


/**
 * Elimina una reserva de la base de datos.
 * @param {*} bookingId - Id de la reserva a eliminar.
 * @returns {Promise<Object>} - Reserva eliminada exitosamente.
 * @throws {Error} - Si ocurre un error al eliminar la reserva en la base de datos.
 */
const deleteBookingInDB = async (bookingId) => {
  try {
    await Booking.destroy({ where: { id: bookingId } });
    return true;
  } catch (error) {
    throw new Error("Error deleting booking: ", error.message);
  }
};

module.exports = {
  getBookingsFromDB,
  createBookingInDB,
  updateBookingStatusInDB,
  deleteBookingInDB
};
