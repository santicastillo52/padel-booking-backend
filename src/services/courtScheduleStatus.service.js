const { DateTime } = require('luxon');
const courtScheduleProvider = require("../providers/courtsSchedules.providers");
const bookingsProvider = require("../providers/bookings.providers");

/**
 * Servicio simple para actualizar automáticamente el estado de los horarios de cancha
 * cuando se cumple la hora final de las reservas.
 */

/**
 * Actualiza el estado de los horarios de cancha que han terminado.
 * Cambia el estado de "booked" a "available" para las reservas que ya han finalizado.
 */
const updateFinishedBookingsStatus = async () => {
  try {
    const now = DateTime.now();
    const currentTime = now.toFormat('HH:mm:ss');
    const currentDate = now.toFormat('yyyy-MM-dd');
    
    console.log(`[${now.toFormat('yyyy-MM-dd HH:mm:ss')}] Verificando reservas terminadas...`);
    
    // Obtener reservas que han terminado
    const finishedBookings = await courtScheduleProvider.getFinishedBookingsFromDB(
      currentTime,
      currentDate
    );
    
    if (finishedBookings.length > 0) {
      console.log(`📋 Encontradas ${finishedBookings.length} reservas terminadas para actualizar`);
      
      // Actualizar el estado de cada horario a "available" y booking a "completed"
      for (const booking of finishedBookings) {
        try {
          // Actualizar el estado del CourtSchedule a "available"
          await courtScheduleProvider.updateCourtScheduleStatusInDB(
            booking.CourtSchedule.id,
            "available"
          );
          
          // Actualizar el estado del Booking a "completed"
          await bookingsProvider.updateBookingStatusInDB(
            booking.id,
            "completed"
          );
          
          console.log(`✅ Reserva ${booking.id} actualizada - CourtSchedule: available, Booking: completed`);
        } catch (error) {
          console.error(`❌ Error actualizando reserva ${booking.id}:`, error.message);
        }
      }
      
      console.log(`✅ Proceso completado. Se actualizaron ${finishedBookings.length} reservas`);
    } else {
      console.log('ℹ️ No hay reservas terminadas para actualizar');
    }
    
    return finishedBookings.length;
  } catch (error) {
    console.error("❌ Error actualizando estados de horarios terminados:", error.message);
    throw error;
  }
};

/**
 * Inicia el servicio automático que se ejecuta cada 30 minutos.
 * Esta función debe ser llamada al iniciar la aplicación.
 */
const startAutomaticStatusUpdate = () => {
  console.log('🚀 Iniciando servicio automático de actualización de estados (cada 30 minutos)');
  
  // Ejecutar inmediatamente al iniciar
  updateFinishedBookingsStatus();
  
  // Programar ejecución cada 30 minutos (30 * 60 * 1000 = 1,800,000 ms)
  setInterval(updateFinishedBookingsStatus, 30 * 60 * 1000);
};

module.exports = {
  updateFinishedBookingsStatus,
  startAutomaticStatusUpdate
}; 