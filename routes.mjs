import { resolve } from 'path';
import db from './models/index.mjs';

// Importing controllers
import games from './controllers/games.mjs';

export default function routes(app) {
  /**
   * TO DO: Middleware user authentication
   */

  // special JS page. Include the webpack index.html file
  app.get('/home', (request, response) => {
    response.sendFile(resolve('js/dist', 'index.html'));
  });

  // games controller function object
  const GamesController = games(db);

  /**
   * Request handler for creating a new game
   */
  app.post('/createGame', GamesController.handleCreateGameRequest);
}
