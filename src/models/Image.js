module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cloudinaryPublicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('court', 'club'),
      allowNull: false,
    },
    CourtId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ClubId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  Image.associate = (models) => {
    Image.belongsTo(models.Court, {
      foreignKey: 'CourtId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    Image.belongsTo(models.Club, {
      foreignKey: 'ClubId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  Image.addHook('beforeDestroy', async (image) => {
    if (!image.cloudinaryPublicId) return;
    const cloudinary = require('../config/cloudinary');
    try {
      await cloudinary.uploader.destroy(image.cloudinaryPublicId);
    } catch (error) {
      console.warn(
        `No se pudo eliminar asset de Cloudinary (${image.cloudinaryPublicId}):`,
        error.message
      );
    }
  });

  return Image;
};
