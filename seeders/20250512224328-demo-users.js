// src/seeders/XXXXXX-users.js (o como se llame tu archivo)
'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('123456', 10); // contraseña real

    return queryInterface.bulkInsert('Users', [
      {
        name: 'Admin Owner',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        position: 'both'
      },
      {
        name: 'Padel Player',
        email: 'player@example.com',
        password: hashedPassword, 
        role: 'client',
        position: 'backhand'
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
