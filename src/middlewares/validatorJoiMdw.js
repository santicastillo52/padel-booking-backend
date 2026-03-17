
/**
 * Middleware para validar datos usando Joi
 * @param {Object} schema - Esquema de validación Joi
 * @param {string} property - Propiedad a validar ('body', 'params', 'query', 'formData')
 * @returns {Function} Middleware de Express
 */
const validation = (schema, property = "body") => {
  return (req, res, next) => {
    let dataToValidate;
    
    // Para formData, combinar body y file
    if (property === "formData") {
      dataToValidate = {
        ...req.body,
        file: req.file || req.files
      };
    } else {
      dataToValidate = req[property];
    }

    const { error, value } = schema.validate(dataToValidate, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        errors: error.details.map(err => err.message),
      });
    }

    // Sanitiza: reemplaza por valores validados (ej: defaults de Joi)
    if (property === "formData") {
      req.body = value;
      // Mantener el file en req.file para el controlador
      if (value.file) {
        req.file = value.file;
      }
    } else {
      req[property] = value;
    }
    
    next();
  };
};

module.exports = validation;
