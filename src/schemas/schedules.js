const Joi = require('joi');

/*
const scheduleFilters = Joi.object({
    date: Joi.
});
*/
const singleSchedule = Joi.object({
    day_of_week: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
    start_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)  // Solo HH:MM
    .required()
    .messages({
        'string.pattern.base': 'start_time debe tener formato HH:MM (ejemplo: 08:00)'
    }),
    end_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)  // Solo HH:MM
    .required()
    .messages({
        'string.pattern.base': 'end_time debe tener formato HH:MM (ejemplo: 17:00)'
    })
});

const scheduleId = Joi.object({
    id: Joi.number().integer().positive().required()
});


const schedulesArray = Joi.array()
    .items(singleSchedule)
    .min(1)             
    .required();

module.exports = {
    singleSchedule,
    scheduleId,
    schedulesArray
}