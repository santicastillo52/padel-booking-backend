const clubsService = require('../services/clubs.services');

const getAllClubs = async (req, res) => { 
    try {
        const filters = req.query;
        const clubs = await clubsService.fetchAllClubs(filters);
        
        res.status(200).json({
            success: true,
            message: 'Clubs retrieved successfully',
            data: clubs
        });
    } catch (error) {
        console.error('Error fetching clubs:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error retrieving clubs',
            error: 'CLUBS_FETCH_ERROR'
        });
    }
}

const getDropdownClubs = async (req, res) => {
    try {
        const clubs = await clubsService.fetchDropdownClubs();
        res.status(200).json({
            success: true,
            message: 'Dropdown clubs retrieved successfully',
            data: clubs
        });
    } catch (error) {
        console.error('Error fetching clubs:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error retrieving clubs',
            error: 'CLUBS_DROPDOWN_ERROR'
        });
    }
}

const getOneClub = async (req, res) => {
    try {
        const { id } = req.params;
        const club = await clubsService.fetchOneClub(id);
        
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found',
                error: 'CLUB_NOT_FOUND'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Club retrieved successfully',
            data: club
        });
    } catch (error) {
        console.error('Error fetching club:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error retrieving club',
            error: 'CLUB_FETCH_ERROR'
        });
    }
}

const getMyClub = async (req, res) => {
    try {
        const userId = req.user.id; 
        const club = await clubsService.fetchMyClub(userId);
        
        if (!club) {
            return res.status(404).json({ 
                success: false,
                message: 'No tienes un club registrado',
                error: 'USER_CLUB_NOT_FOUND'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Your club retrieved successfully',
            data: club
        });
    } catch (error) {
        console.error('Error fetching club:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error retrieving club',
            error: 'MY_CLUB_FETCH_ERROR'
        });
    }
}


/**
 * Crear un nuevo club con validación de imagen
 * @param {Object} req - Request object con datos del club y archivo validado
 * @param {Object} res - Response object
 */
const createClub = async (req, res) => {
    try {
        const clubData = req.body;
        const file = req.file;
        
        const newClub = await clubsService.createClub(clubData, file);
        
        res.status(201).json({
            success: true,
            message: 'Club created successfully',
            data: newClub
        });
    } catch (error) {
        console.error('Error creating club:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error creating club',
            error: 'CLUB_CREATE_ERROR'
        });
    }
}

//falta edit club y delete club 

module.exports = {getAllClubs, getDropdownClubs, getOneClub, getMyClub, createClub};
