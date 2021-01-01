export default function gameModel(sequelize, DataTypes) {
  return sequelize.define('Game', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    boardState: {
      // allow us to keep non-relational data for the state of boards
      // It will hold the following data
      // last dice set thrown
      // last player
      // details of each cell - tokens present in a cell and owner of those tokens
      type: DataTypes.JSON,
    },
    winnerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  });
}
