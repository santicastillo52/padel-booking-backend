
module.exports = (sequelize, DataTypes) => {
  const Club = sequelize.define('Club', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Club.associate = (models) => {
    Club.belongsTo(models.User, { foreignKey: 'UserId' });
    Club.hasMany(models.Court, { foreignKey: 'clubId' });
    Club.hasMany(models.Image, {
      foreignKey: 'ClubId',
      onDelete: 'CASCADE',
    });
  };

  Club.addHook('beforeDestroy', async (club) => {
    const { Image, Court } = club.sequelize.models;

    const courts = await Court.findAll({
      where: { clubId: club.id },
      attributes: ['id'],
    });
    const courtIds = courts.map((court) => court.id);

    if (courtIds.length > 0) {
      const courtImages = await Image.findAll({
        where: { CourtId: courtIds },
      });
      for (const image of courtImages) {
        await image.destroy();
      }
    }

    const clubImages = await Image.findAll({ where: { ClubId: club.id } });
    for (const image of clubImages) {
      await image.destroy();
    }
  });

  return Club;
};


