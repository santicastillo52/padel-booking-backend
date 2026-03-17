
const userService = require('../services/users.services');

const getAllUsers = async (req, res) => {
  
  try {
    const filters = req.query;
    const users = await userService.fetchAllUsers(filters);
    
    res.status(200).json({
      success: true,
      message: 'Usuarios obtenidos correctamente',
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error al obtener usuarios',
      error: 'USER_FETCH_ERROR'
    });
  }
}

const getUserById = async (req, res) => {
  try {
    const userId =  req.params.id;
    const user = await userService.fetchUserById(userId);
    res.status(200).json({
      success: true,
      message: 'Usuario obtenido correctamente',
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error al obtener usuario',
      error: 'USER_FETCH_ERROR'
    });
  }
}

const updateUser = async (req, res)=> {
  try {
    const userId = req.params.id;
    const userData = req.body;
    
    const updatedUser = await userService.updateUser(userId, userData);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'USER_NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: updatedUser
    });
  } catch (error) {

    res.status(500).json({ 
      success: false, 
      message: 'Error updating user',
      error: 'USER_UPDATE_ERROR'
    });
  }
}


module.exports = {getAllUsers, getUserById, updateUser}; 