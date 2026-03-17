const { Booking, Club } = require('../models');

/**
 * Middleware para validar que el usuario puede acceder a sus propios bookings
 * o que es admin del club. Para rutas como getAllBookings y getAllReservations
 * donde el ID en params debe coincidir con el usuario autenticado.
 */
const checkUserAccessOrAdmin = async (req, res, next) => {
  try {
    const authenticatedUserId = req.user.id;
    const targetUserId = parseInt(req.params.id);
    //Dato importante: el role lo sacamos desde el JWT
    const userRole = req.user.role;

    // Si es cliente, solo puede acceder a sus propios datos
    if (userRole === 'client') {
      if (authenticatedUserId !== targetUserId) {
        return res.status(403).json({ 
          message: 'Solo puedes acceder a tus propias reservas',
          error: 'FORBIDDEN_ACCESS'
        });
      }
      return next();
    }

    // Si es admin, verificar que sea dueño del club
    if (userRole === 'admin') {
      // Para getAllReservations, el ID es del club, verificar ownership
      if (req.path.includes('/reservations/')) {
        const clubId = targetUserId;
        console.log(clubId, authenticatedUserId)
        const club = await Club.findOne({
          where: { id: clubId, UserId: authenticatedUserId }
        });
        
        if (!club) {
          return res.status(403).json({ 
            message: 'No puedes acceder a las reservas de este club',
            error: 'FORBIDDEN_ACCESS'
          });
        }
        return next();
      }
      
      // Para getAllBookings, permitir acceso (admin puede ver bookings de cualquier usuario de sus clubs)
      return next();
    }

    return res.status(403).json({ 
      message: 'Acceso denegado',
      error: 'FORBIDDEN_ACCESS'
    });

  } catch (error) {
    console.error('Error en checkUserAccessOrAdmin:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Middleware para validar que el usuario puede modificar/eliminar un booking.
 * Permite acceso si es el dueño de la reserva o es admin del club donde se hizo la reserva.
 */
const checkBookingOwnershipOrAdmin = async (req, res, next) => {
  try {
    const authenticatedUserId = req.user.id;
    const userRole = req.user.role;
    
    // Obtener el ID del booking desde params o body
    const bookingId = req.params.id || req.body.id;
    
    if (!bookingId) {
      return res.status(400).json({ 
        message: 'ID de reserva requerido',
        error: 'MISSING_BOOKING_ID'
      });
    }

    // Obtener el booking con la información del club
    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Club,
          attributes: ['id', 'UserId']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ 
        message: 'Reserva no encontrada',
        error: 'BOOKING_NOT_FOUND'
      });
    }

    // Si es cliente, solo puede modificar sus propias reservas
    if (userRole === 'client') {
      if (booking.userId !== authenticatedUserId) {
        return res.status(403).json({ 
          message: 'Solo puedes modificar tus propias reservas',
          error: 'FORBIDDEN_ACCESS'
        });
      }
      return next();
    }

    // Si es admin, verificar que sea dueño del club donde se hizo la reserva
    if (userRole === 'admin') {
      if (booking.Club && booking.Club.UserId === authenticatedUserId) {
        return next();
      }
      
      return res.status(403).json({ 
        message: 'Solo puedes modificar reservas de tu club',
        error: 'FORBIDDEN_ACCESS'
      });
    }

    return res.status(403).json({ 
      message: 'Acceso denegado',
      error: 'FORBIDDEN_ACCESS'
    });

  } catch (error) {
    console.error('Error en checkBookingOwnershipOrAdmin:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    });
  }
};

module.exports = { 
  checkUserAccessOrAdmin, 
  checkBookingOwnershipOrAdmin 
};
