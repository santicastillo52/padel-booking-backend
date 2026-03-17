const Joi = require('joi');

const loginUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().max(25).required()
});

const registerUserSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    position: Joi.string().valid('backhand', 'forehand', 'both').required(),
    level: Joi.number().integer().min(1).max(8).required(),
    gender: Joi.string().valid("male", "female", "unspecified").required()
});




module.exports = {
    loginUserSchema, registerUserSchema
};



