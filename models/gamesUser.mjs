// This model is defined, as there will be need to retrieve the game id and playerid

export default function gamesUserModel(sequelize, DataTypes) {
  return sequelize.define(
    'GamesUser',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      GameId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Games',
          key: 'id',
        },
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      GameTokenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'GameTokens',
          key: 'id',
        },
      },
    },
    {
      // timestamps: false prevents Sequelize from adding
      // createdAt and updatedAt timestamp fields
      // https://sequelize.org/master/class/lib/model.js~Model.html#static-method-init
      timestamps: false,
    },
  );
}
