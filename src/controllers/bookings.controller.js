const bookingsService = require('../services/bookings.services');

const getAllBookings = async (req, res) => {
    try {
        const {id} = req.user;
        const {role} = req.user
        const {status} = req.query;
        const bookings = await bookingsService.fetchAllBookings(id, role, status);
        
        res.status(200).json({
            success: true,
            message: 'Bookings retrieved successfully',
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error retrieving bookings',
            error: 'BOOKING_FETCH_ERROR'
        });
    }
};

const createBooking = async (req, res) => {
    try {
        const bookingData = req.body;
        const userId = req.user.id
        const newBooking = await bookingsService.addBooking(bookingData, userId);
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: newBooking
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error creating booking',
            error: 'BOOKING_CREATE_ERROR'
        });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const {status} = req.body;
        const bookingId = req.params.id;
        const userRole= req.user.role;
        const updatedBooking = await bookingsService.updateBookingStatus(bookingId, status, userRole);
        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: updatedBooking
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error updating booking status',
            error: 'BOOKING_UPDATE_ERROR'
        });
    }
}

const deleteBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const deletedBooking = await bookingsService.deleteBooking(bookingId);
        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully',
            data: deletedBooking
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error deleting booking',
            error: 'BOOKING_DELETE_ERROR'
        });
    }
};

module.exports = {getAllBookings, createBooking, updateBookingStatus, deleteBooking};