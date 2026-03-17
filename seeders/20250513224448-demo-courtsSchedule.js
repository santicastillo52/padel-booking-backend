'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('CourtSchedules', [
      {
        day_of_week: 'monday',
        start_time: '09:00',
        end_time: '10:00',
        courtId: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        day_of_week: 'monday',
        start_time: '10:00',
        end_time: '11:00',
        courtId: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CourtSchedules', null, {});
  }
};
