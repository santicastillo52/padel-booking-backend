


module.exports = (sequelize, DataTypes) => {
  const Court = sequelize.define('Court', {
    id: {  
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wall_type: {
      type: DataTypes.ENUM('acrylic', 'cement'),
      allowNull: false,
    },
    court_type: {
      type: DataTypes.ENUM('indoor', 'outdoor'),
      allowNull: false,
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  });

  Court.associate = (models) => {
    Court.belongsTo(models.Club, { foreignKey: 'clubId', onDelete: 'CASCADE', });
    Court.hasMany(models.CourtSchedule, {
      foreignKey: 'courtId',
      onDelete: 'CASCADE',
      hooks: true,
    });
    Court.hasMany(models.Image, {
      foreignKey: 'CourtId',
      onDelete: 'CASCADE',
    });
  };

  Court.addHook('beforeDestroy', async (court) => {
    const { Image } = court.sequelize.models;
    const images = await Image.findAll({ where: { CourtId: court.id } });
    for (const image of images) {
      await image.destroy();
    }
  });

  return Court;
}

