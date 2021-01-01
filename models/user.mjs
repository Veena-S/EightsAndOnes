export default function userModel(sequelize, dataTypes) {
  return sequelize.define('User', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: dataTypes.INTEGER,
    },
    email: {
      allowNull: false,
      type: dataTypes.STRING,
      unique: true,
      validate: {
        notNull: { msg: 'User must have an email id' },
        notEmpty: { msg: 'email cannot be empty' },
        isEmail: { msg: 'Provide a valid email' },
      },
    },
    password: {
      allowNull: false,
      type: dataTypes.STRING,
      unique: true,
    },
    createdAt: {
      allowNull: false,
      type: dataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: dataTypes.DATE,
    },
  });
}
