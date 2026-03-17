const courtsService = require('../services/courts.services');
const { createCourtsSchema, validateCourtImages } = require('../schemas/courts');

/**
 * Obtiene todas las canchas aplicando filtros opcionales desde la query string.
 *
 * @param {Object} req - Objeto request de Express.
 * @param {Object} req.query - Filtros opcionales (name, wall_type, court_type, clubId).
 * @param {Object} res - Objeto response de Express.
 * @returns {Promise<void>} Responde con un JSON que contiene las canchas encontradas.
 */
const getAllCourts = async (req, res) => {
    try {
        const filters = req.query;  
        const courts = await courtsService.fetchAllCourts(filters);
        
        res.status(200).json({
            success: true,
            message: 'Courts retrieved successfully',
            data: courts
        });
    } catch (error) {
        console.error('Error fetching courts:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error fetching courts',
            error: 'COURTS_FETCH_ERROR'
        });
    }
}

/**
 * Obtiene las canchas disponibles con sus horarios próximos desde hoy hasta el día anterior de la próxima semana.
 *
 * @param {Object} req - Objeto request de Express.
 * @param {Object} req.query - Filtros opcionales (day_of_week, start_time, end_time, clubId, wall_type, court_type).
 * @param {Object} res - Objeto response de Express.
 * @returns {Promise<void>} Responde con un JSON que contiene las canchas disponibles con sus horarios.
 */
const getAvailableCourts = async (req, res) => {
    try {
        const filters = req.query;
        const availableCourts = await courtsService.fetchAvailableCourts(filters);
        
        res.status(200).json({
            success: true,
            message: 'Available courts retrieved successfully',
            data: availableCourts
        });
    } catch (error) {
        console.error('Error fetching available courts:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error fetching available courts',
            error: 'AVAILABLE_COURTS_FETCH_ERROR'
        });
    }
}

const getCourtById = async (req, res) => {
    try{
        const courtId = req.params.id;
        const court = await courtsService.fetchCourtById(courtId);
        res.status(200).json({
            success: true,
            message: 'Court retrieved successfully',
            data: court
        });
    }
    catch (error) {
        console.error('Error fetching court:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error fetching court',
            error: 'COURT_FETCH_ERROR'
        });
    }
}

const createCourts = async (req, res) => {
    try {
        // Usar las canchas ya procesadas por el middleware
        const courts = req.processedCourts || [];
        const files = req.files || [];
        const userId = req.user.id;
        
        // Validar datos con Joi (convierte automáticamente clubId a número)
        const { error, value } = createCourtsSchema.validate({ courts });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                error: 'VALIDATION_ERROR'
            });
        }
        
        // Usar los datos ya validados y convertidos por Joi
        const validatedCourts = value.courts;
        
        // Validar imágenes
        try {
            validateCourtImages(files, validatedCourts.length);
        } catch (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError.message,
                error: 'IMAGE_VALIDATION_ERROR'
            });
        }
        
        const newCourts = await courtsService.addNewCourts(validatedCourts, files, userId);
        
        res.status(201).json({
            success: true,
            message: 'Courts created successfully',
            data: newCourts
        });
    } catch (error) {
        console.error('Error creating court:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error creating court',
            error: 'COURT_CREATE_ERROR'
        });
    }
}

const editCourt =  async (req, res) => {
    try {
        const courtId =  req.params.id;
        const courtData = req.body;
        const updatedCourt =  await courtsService.editCourt(courtId, courtData)
        res.status(200).json({
            success: true,
            message: 'Court updated successfully',
            data: updatedCourt
        });
    } catch (error){
        console.error('Error editing court: ', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error editing court',
            error: 'COURT_UPDATE_ERROR'
        });
    }
}

const deleteCourt =  async (req, res) => {
    try {
        const courtId = req.params.id;
        const deletedCourt =  await courtsService.deleteCourt(courtId);
        res.status(200).json({
            success: true,
            message: 'Court deleted successfully',
            data: deletedCourt
        });
    } catch (error){
        console.error('Error deleting court' , error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error deleting court',
            error: 'COURT_DELETE_ERROR'
        });
    }
}



module.exports = { getAllCourts, createCourts, getCourtById, editCourt, deleteCourt, getAvailableCourts };