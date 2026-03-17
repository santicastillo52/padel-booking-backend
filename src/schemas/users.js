const Joi = require('joi');

const userId = Joi.object({
    id: Joi.number().integer().positive().required()
});

const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    last_name: Joi.string().max(50).optional(),
    position: Joi.string().valid("forehand", "backhand", "both").optional(),
    level: Joi.number().integer().min(1).max(8).optional(),
  }).min(1); // para evitar updates vacíos

  module.exports = {
    userId,
    updateUserSchema
  };