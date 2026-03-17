'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize')} Sequelize
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('admin', 'client'),
        allowNull: false,
      },
      position: {
        type: Sequelize.ENUM('backhand', 'forehand', 'both'),
        allowNull: true,
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'unspecified'),
        allowNull: false,
        defaultValue: 'male',
      },
    });
  },

  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize')} Sequelize
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
