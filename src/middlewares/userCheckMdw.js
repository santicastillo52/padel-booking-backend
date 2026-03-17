const checkUserOwnership = (req, res, next) => {
    const authenticatedUserId = req.user.id;
    const targetUserId = parseInt(req.params.id);
    
    if (authenticatedUserId !== targetUserId) {
      return res.status(403).json({ 
        message: 'Solo puedes editar tu propio perfil',
        error: 'FORBIDDEN_ACCESS'
      });
    }
    
    next();
  };
  
  module.exports = checkUserOwnership;