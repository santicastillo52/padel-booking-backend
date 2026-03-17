'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize')} Sequelize
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Courts', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      wall_type: {
        type: Sequelize.ENUM('acrylic', 'cement'),
        allowNull: false,
      },
      court_type: {
        type: Sequelize.ENUM('indoor', 'outdoor'),
        allowNull: false,
      },
      available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      clubId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Clubs', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },

  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize')} Sequelize
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Courts');
  }
};
