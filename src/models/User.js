

module.exports = (sequelize,DataTypes) => { 
  const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'client'),
    allowNull: false,
    defaultValue: 'client'

  },
  position: {
    type: DataTypes.ENUM('backhand', 'forehand', 'both'),
    allowNull: true,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 8
    },
    defaultValue: 1
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'unspecified'),
    allowNull: false,
    defaultValue: 'male'
  }
}, 
{
  tableName: 'Users',
  timestamps: false, // 🔹 Desactiva los timestamps
});
 User.associate = (models) => {
    User.hasMany(models.Club, {
      foreignKey: 'UserId'
    });
  };
return User;
}
