const courtsSchedulesService = require('../services/courtsSchedules.services');

const getAllCourtsSchedules = async (req, res) => {
    try {
        const filters = req.query;
        const courtsSchedules = await courtsSchedulesService.fetchAllCourtsSchedules(filters);

        res.status(200).json({
            success: true,
            message: 'Courts schedules retrieved successfully',
            data: courtsSchedules
        });
    } catch (error) {
        console.error('Error fetching courts schedules:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error retrieving courts schedules',
            error: 'COURT_SCHEDULE_FETCH_ERROR'
        });
    }
};

const createCourtsSchedules = async (req, res) => {
    try {
        const courtId = req.params.id;
        const userId = req.user.id;
       
        const newSchedule = req.body;
        const createdSchedule = await courtsSchedulesService.createCourtsSchedules(newSchedule, courtId, userId);

        res.status(201).json({
            success: true,
            message: 'Court schedule created successfully',
            data: createdSchedule
        });
    } catch (error) {
        console.error('Error creating courts schedule:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating courts schedule',
            error: 'COURT_SCHEDULE_CREATE_ERROR'
        });
    }
};

const deleteCourtSchedule = async (req, res) => {
    try { 
        const id = req.params.id;
        const userId = req.user.id;
        const deletedSchedule = await courtsSchedulesService.deleteCourtSchedule(id, userId);
        res.status(200).json({
            success: true,
            message: 'Court schedule deleted successfully',
            data: deletedSchedule
        });
    } catch (error) {
        console.error('Error deleting courts schedule:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting court schedule',
            error: 'COURT_SCHEDULE_DELETE_ERROR'
        });
    }
};

module.exports = {getAllCourtsSchedules, createCourtsSchedules, deleteCourtSchedule};