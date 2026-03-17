const { User } = require("../models");
const bcrypt = require("../providers/bcrypt.provider");
const jwt = require("../providers/jwt.provider");
const userProvider = require("../providers/users.providers");

/**
 * Crea un nuevo usuario en la base de datos, hashea la contraseña, genera un token JWT y devuelve información del usuario.
 *
 * @param {Object} param0 - Datos del usuario a crear.
 * @param {string} param0.name - Nombre del usuario.
 * @param {string} param0.email - Correo electrónico del usuario.
 * @param {string} param0.password - Contraseña sin encriptar.
 * @param {string} param0.role - Rol del usuario.
 * @param {string} [param0.position] - Posición del usuario (opcional).
 * @throws {Error} Si ya existe un usuario con el mismo email.
 * @returns {Promise<Object>} Objeto con mensaje, token JWT y datos del usuario creado.
 */

const createUser = async ({ name, last_name, email, password, role, position, level, gender}) => {
  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('El usuario ya existe');
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hashPassword(password);

  // Crear el usuario en la base de datos
  const newUser = await userProvider.createUserInDB({
    name,
    last_name,
    email,
    password: hashedPassword,
    role,
    position,
    level,
    gender,
  });

  // Generar token JWT
  const token = jwt.generateToken({
    id: newUser.id,
    name: newUser.name,
    role: newUser.role,
  });

  return {
    message: "Usuario registrado correctamente",
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      last_name: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      position: newUser.position,
      level: newUser.level,
      gender: newUser.gender,
    },
  };
};

module.exports = { createUser };
