import { Sequelize } from 'sequelize';
import url from 'url';
import allConfig from '../config/config.js';

import gameModel from './game.mjs';
import userModel from './user.mjs';
import gamesUserModel from './gamesUser.mjs';

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

// Associations
// A user can have many games and a Game can have many users
// i.e. Many to many association exists between Games and Users table
// Here it is through the join table "GamesUsers"
db.User.belongsToMany(db.Game, { through: db.GamesUser });
db.Game.belongsToMany(db.User, { through: db.GamesUser });

// Also Users table is directly associated with Games table as 1 to Many association
// A game can have a winner
// Games table holds the user id as the winner id
// A game can have only one winner
// A user can be winner of many games
// A user is associated with a Game directly
db.Game.belongsTo(db.User);
db.User.hasMany(db.Game);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
