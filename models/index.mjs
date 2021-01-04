import { Sequelize } from 'sequelize';
import url from 'url';
import allConfig from '../config/config.js';

import gameModel from './game.mjs';
import userModel from './user.mjs';
import gamesUserModel from './gamesUser.mjs';
import gameTokenModel from './gameToken.mjs';

const env = process.env.NODE_ENV || 'development';

const config = allConfig[env];

const db = {};

let sequelize;

if (env === 'production') {
  // break apart the Heroku database url and rebuild the configs we need

  const { DATABASE_URL } = process.env;
  const dbUrl = url.parse(DATABASE_URL);
  const username = dbUrl.auth.substr(0, dbUrl.auth.indexOf(':'));
  const password = dbUrl.auth.substr(dbUrl.auth.indexOf(':') + 1, dbUrl.auth.length);
  const dbName = dbUrl.path.slice(1);

  const host = dbUrl.hostname;
  const { port } = dbUrl;

  config.host = host;
  config.port = port;

  sequelize = new Sequelize(dbName, username, password, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Model definitions
db.Game = gameModel(sequelize, Sequelize.DataTypes);
db.User = userModel(sequelize, Sequelize.DataTypes);
db.GamesUser = gamesUserModel(sequelize, Sequelize.DataTypes);
db.GameToken = gameTokenModel(sequelize, Sequelize.DataTypes);

// Associations
// A user can have many games and a Game can have many users
// i.e. Many to many association exists between Games and Users table
// Here it is through the join table "GamesUsers"
db.User.belongsToMany(db.Game, { through: db.GamesUser });
db.Game.belongsToMany(db.User, { through: db.GamesUser });

// Association of GameTokens
// A token can have many games.
db.GameToken.belongsToMany(db.Game, { through: db.GamesUser });
// A game can have many tokens.
db.Game.belongsToMany(db.GameToken, { through: db.GamesUser });

// A player can have many tokens
db.User.belongsToMany(db.GameToken, { through: db.GamesUser });
// A token can have many players
db.GameToken.belongsToMany(db.User, { through: db.GamesUser });

// Also specify the super-many-to-many relationship
// GamesUser holds UserId
db.GamesUser.belongsTo(db.User);
db.User.hasMany(db.GamesUser);
db.GamesUser.belongsTo(db.Game);
db.Game.hasMany(db.GamesUser);
// GameUser holds TokenId
db.GamesUser.belongsTo(db.GameToken);
db.GameToken.hasMany(db.GamesUser);

// Also Users table is directly associated with Games table as 1 to Many association
// Games table holds the user id as the winner id
// A game can have only one winner
// A user is associated with a Game directly
db.Game.belongsTo(db.User, { as: 'winner' }); // Adds winnerId to Games rather than userId
// Game holds the UserId as winnerId
// db.User.hasMany(db.Game, { as: 'winner' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
