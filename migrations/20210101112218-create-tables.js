module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('Games', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      boardState: {
        // allow us to keep non-relational data for the state of boards
        // It will hold the following data
        // last dice set thrown
        // last player
        // details of each cell - tokens present in a cell and owner of those tokens
        type: Sequelize.JSON,
      },
      winnerId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('GameTokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // To store an image that can be used as a game piece
      imageFilePath: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    await queryInterface.createTable('GamesUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      GameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Games',
          key: 'id',
        },
      },
      PlayerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      TokenId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'GameTokens',
          key: 'id',
        },
      },
      // createdAt: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      // },
      // updatedAt: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      // },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GamesUsers');
    await queryInterface.dropTable('GameTokens');
    await queryInterface.dropTable('Games');
    await queryInterface.dropTable('Users');
  },
};
