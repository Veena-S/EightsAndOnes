module.exports = {
  up: async (queryInterface, Sequelize) => {
    const gameTokensList = [
      // The stored images parent folder is considered to be
      // public/tokenImages
      {
        imageFilePath: 'token-1.png',
      },
      {
        imageFilePath: 'token-2.png',
      },
      {
        imageFilePath: 'token-3.png',
      },
      {
        imageFilePath: 'token-4.png',
      },
      {
        imageFilePath: 'token-5.png',
      },
    ];

    // Insert the GameTokens list
    const gameTokens = await queryInterface.bulkInsert('GameTokens', gameTokensList, { returning: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('GameTokens', null, {});
  },
};
