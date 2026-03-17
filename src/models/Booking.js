

module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    courtId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courts',
        key: 'id'
      }
    },
    courtScheduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CourtSchedules',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    clubId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Clubs',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, { foreignKey: 'userId' });
    Booking.belongsTo(models.Court, { foreignKey: 'courtId' });
    Booking.belongsTo(models.CourtSchedule, { foreignKey: 'courtScheduleId' });
    Booking.belongsTo(models.Club, { foreignKey: 'clubId' });
  };

  return Booking;
};

