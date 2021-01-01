// Importing another local mjs file will not work with seed files.
// Also, need to use require for node modules
const jsSHA = require('jssha');

/**
   * Hashing passwords using jsSHA library
   */
function generatedHashedValue(unhashedValueInput) {
  const unhashedValue = unhashedValueInput;
  // initialise the SHA object
  // eslint-disable-next-line new-cap
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  // input the password from the request to the SHA object
  shaObj.update(unhashedValue);
  // get the hashed password as output from the SHA object
  const hashedValue = shaObj.getHash('HEX');
  console.log(`UnhashedValue: ${unhashedValue}, HashedValue: ${hashedValue}`);
  return hashedValue;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const usersList = [
      {
        email: 'user1@games.com',
        password: generatedHashedValue('user1'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'user2@games.com',
        password: generatedHashedValue('user2'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert the users list
    const users = await queryInterface.bulkInsert('Users', usersList, { returning: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
