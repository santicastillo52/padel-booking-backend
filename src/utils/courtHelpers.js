/**
 * Devuelve la fecha del próximo día de la semana especificado a partir de una fecha dada.
 * Compatible con Luxon DateTime. Si el día objetivo es hoy, devuelve la fecha de la próxima semana.
 *
 * @param {number} targetWeekday - Día de la semana (1: Lunes, 2: Martes, ..., 7: Domingo).
 * @param {DateTime} [fromDate] - Fecha de referencia (opcional, usa DateTime.now() si no se proporciona).
 * @returns {string} Fecha en formato YYYY-MM-DD correspondiente al próximo targetWeekday.
 * @throws {Error} Si targetWeekday no es un número válido entre 1 y 7.
 * 
 * @example
 * // Si hoy es miércoles (día 3), obtener el próximo lunes (día 1)
 * const nextMonday = getNextDateForWeekday(1); // Devuelve fecha del próximo lunes
 * 
 * // Obtener el próximo viernes desde una fecha específica
 * const fromDate = DateTime.fromISO('2024-01-15'); // Lunes
 * const nextFriday = getNextDateForWeekday(5, fromDate); // Devuelve fecha del próximo viernes
 * 
 * // Si hoy es domingo (día 7), obtener el próximo domingo
 * const nextSunday = getNextDateForWeekday(7); // Devuelve fecha del próximo domingo
 */
function getNextDateForWeekday(targetWeekday, fromDate = null) {
    const { DateTime } = require('luxon');
    const baseDate = fromDate || DateTime.now().setZone('America/Argentina/Buenos_Aires');
    const currentWeekday = baseDate.weekday;
    let daysToAdd = (targetWeekday - currentWeekday + 7) % 7;
    if (daysToAdd === 0) daysToAdd = 7; // Siempre el próximo, no hoy
    const nextDate = baseDate.plus({ days: daysToAdd });
    return nextDate.toISODate();
}





module.exports = { 
  getNextDateForWeekday
};