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
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  };

  return Image;
};
