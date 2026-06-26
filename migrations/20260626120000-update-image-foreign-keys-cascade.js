'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeConstraint('Images', 'Images_CourtId_fkey');
    await queryInterface.removeConstraint('Images', 'Images_ClubId_fkey');

    await queryInterface.addConstraint('Images', {
      fields: ['CourtId'],
      type: 'foreign key',
      name: 'Images_CourtId_fkey',
      references: {
        table: 'Courts',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('Images', {
      fields: ['ClubId'],
      type: 'foreign key',
      name: 'Images_ClubId_fkey',
      references: {
        table: 'Clubs',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('Images', 'Images_CourtId_fkey');
    await queryInterface.removeConstraint('Images', 'Images_ClubId_fkey');

    await queryInterface.addConstraint('Images', {
      fields: ['CourtId'],
      type: 'foreign key',
      name: 'Images_CourtId_fkey',
      references: {
        table: 'Courts',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('Images', {
      fields: ['ClubId'],
      type: 'foreign key',
      name: 'Images_ClubId_fkey',
      references: {
        table: 'Clubs',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },
};
