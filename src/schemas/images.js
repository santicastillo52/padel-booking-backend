const Joi = require('joi');

const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const maxSize = 5 * 1024 * 1024;

const imageId = Joi.object({
    id: Joi.number().integer().positive().required()
});

const imageTypes = Joi.object({
    file: Joi.object({
        mimetype: Joi.string().valid(...allowedMimeTypes).required(),
        size: Joi.number().max(maxSize).required(),
    }).required().unknown(true)
});

const uploadImage = Joi.object({
    type: Joi.string().valid('club', 'court').required(),
    clubId: Joi.number().integer().positive(),
    courtId: Joi.number().integer().positive()
}).xor('clubId', 'courtId');


module.exports = {
    imageId,
    imageTypes,
    uploadImage
}