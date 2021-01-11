import { resolve } from 'path';
import db from './models/index.mjs';

// Importing controllers
import userValidator from './controllers/userValidator.mjs';
import users from './controllers/users.mjs';
import games from './controllers/games.mjs';
import tokens from './controllers/tokens.mjs';

export default function routes(app) {
  /**
   * TO DO: Middleware user authentication
   */
  // Set the middleware to authenticate the user
  const userValidatorLib = userValidator(db);
  // console.log(userValidatorLib);
  // app.use(userValidatorLib.authenticateRequestUsingCookies);

  // special JS page. Include the webpack index.html file
  app.get('/home', (request, response) => {
    console.log('/home');
    response.sendFile(resolve('js/dist', 'index.html'));
  });

  const userController = users(db);
  app.get('/all-users', userController.getAllUsers);
  // Accept a POST request to log a user in.
  app.post('/login', userValidatorLib.handleLoginRequest);

  // Accept a POST request to create new user
  app.post('/signup', userController.createNewUser);

  // games controller function object
  const GamesController = games(db);
  // Request handler for creating a new game
  app.get('/refreshGame', GamesController.handleRefreshRequest);
  app.post('/setNextPlayer', GamesController.handleSetNextPlayerRequest);
  app.post('/createGame', GamesController.handleCreateGameRequest);
  app.post('/throwDice', GamesController.handlePlayRollingDiceSticks);
  app.post('/validateMove', GamesController.handleValidateTokenMoveRequest);
  // app.post('/moveTokens', GamesController.handleMoveTokensRequest);

  // Tokens controller function object
  const TokensController = tokens(db);
  // Request handler to get all the game tokens present
  app.get('/tokens', TokensController.handleGetAllTokensRequest);
}
