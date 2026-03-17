const Joi = require('joi'); 

const clubId = Joi.object({
    id: Joi.number().integer().positive().required()
});

/**
 * Esquema para validar la creación de un club con imagen
 */
const createClub = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    address: Joi.string().max(50).required(),
    phone: Joi.number().integer().required(),
    email: Joi.string().email().required(),
    UserId: Joi.number().integer().positive().required(),
    
    // Validación de archivo de imagen
    file: Joi.object({
        fieldname: Joi.string().required(),
        originalname: Joi.string().pattern(/\.(jpg|jpeg|png|gif|webp)$/i).required()
            .messages({
                'string.pattern.base': 'El archivo debe ser una imagen válida (jpg, jpeg, png, gif, webp)'
            }),
        encoding: Joi.string().required(),
        mimetype: Joi.string().valid('image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp').required()
            .messages({
                'any.only': 'El tipo de archivo debe ser una imagen válida (JPEG, PNG, GIF, WEBP)'
            }),
        size: Joi.number().min(1024).max(5 * 1024 * 1024).required() // 1KB a 5MB
            .messages({
                'number.min': 'El archivo debe ser al menos de 1KB',
                'number.max': 'El archivo no puede superar los 5MB'
            }),
        buffer: Joi.binary().required()
    }).required()
        .messages({
            'any.required': 'Debe proporcionar una imagen para el club'
        })
}).min(1);

module.exports = {clubId, createClub}