'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminUser = await queryInterface.rawSelect(
      'Users',
      {
        where: {
          email: 'admin@example.com',
        },
      },
      ['id']
    );

    if (!adminUser) {
      throw new Error('Admin user not found. Seed the Users table first.');
    }

    await queryInterface.bulkInsert('Clubs', [
      {
        name: 'Padel Club Central Train',
        address: '123 Main St',
        phone: '123456789',
        email: 'contact@padelcentral.com',
        UserId: adminUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Clubs', {
      name: 'Padel Club Central',
    });
  },
};
