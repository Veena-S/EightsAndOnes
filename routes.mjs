import { resolve } from 'path';
import db from './models/index.mjs';

// Importing controllers
import users from './controllers/users.mjs';
import games from './controllers/games.mjs';
import tokens from './controllers/tokens.mjs';

export default function routes(app) {
  /**
   * TO DO: Middleware user authentication
   */

  // special JS page. Include the webpack index.html file
  app.get('/home', (request, response) => {
    response.sendFile(resolve('js/dist', 'index.html'));
  });

  const userController = users(db);
  app.get('/all-users', userController.getAllUsers);

  // games controller function object
  const GamesController = games(db);
  // Request handler for creating a new game
  app.post('/createGame', GamesController.handleCreateGameRequest);

  // Tokens controller function object
  const TokensController = tokens(db);
  // Request handler to get all the game tokens present
  app.get('/tokens', TokensController.handleGetAllTokensRequest);
}
