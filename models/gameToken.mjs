export default function gameTokenModel(sequelize, DataTypes) {
  return sequelize.define('GameToken',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      imageFilePath: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      // timestamps: false prevents Sequelize from adding
      // createdAt and updatedAt timestamp fields
      // https://sequelize.org/master/class/lib/model.js~Model.html#static-method-init
      timestamps: false,
    });
}
