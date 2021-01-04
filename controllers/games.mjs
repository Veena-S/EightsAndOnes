/**
 *
 * Controller helper functions
 */

/**
 *
 * Controller Section
 *
 */
/**
 *
 * @param db - instance of the db models
 */
export default function games(db) {
  /**
   *
   * @param request - HTTP request
   * @param response - HTTP response
   */
  const handleCreateGameRequest = async (request, response) => {
    console.log('handleCreateGameRequest');
    /**
     * boardSize = size of the board to be created
     * playerTokenArray = An array of objects that holds info on players and their selected tokens
     */
    console.log(request.body);
    const { boardSize, playerTokenArray, playersList } = request.body.data;
    console.log(`boardSize: ${boardSize}`);
    console.log(`playerTokenArray: ${playerTokenArray}`);
    console.log(`playersList: ${playersList}`);

    // Create a new Game entry
    // At the start of the game, no player tokens will be present inside the board
    // It will hold the following data
    // last dice set thrown
    // last player
    // next player
    // details of each cell - tokens present in a cell and owner of those tokens
    const newGameData = {
      boardState: {
        lastDiceSet: [],
        lastPlayer: -1,
        nextPlayer: playersList[0].id,
      },

    };
    try {
      const newGame = await db.Game.create(newGameData);

      console.log(`newGame: ${newGame}`);

      // /**
      //  * To do: Delete
      //  */
      // let winID = newGame.winnerId;
      // winID = await newGame.getWinner();
      // winID = await newGame.setWinner(playersList[1].id);
      // console.log(winID);

      // Also create entries for the GamesUsers table
      const gameUsersTokenList = [];
      playerTokenArray.forEach((playerTokenInfo) => {
        const data = {
          GameId: newGame.id,
          UserId: playerTokenInfo.playerId,
          GameTokenId: playerTokenInfo.tokenId,
        };
        gameUsersTokenList.push(data);
      });
      const newGameUsers = await db.GamesUser.bulkCreate(gameUsersTokenList);
      console.log(newGameUsers);

      // Send the new Game Id and game data to the client
      response.status(200).send({
        gameStatus: 'success',
        msg: 'New game creation success!!',
        gameId: newGame.id,
        currentBoardState: newGame.boardState,
      });
    }
    catch (error)
    {
      console.log(error);
      response.status(500).send({ gameStatus: 'error', msg: 'New game creation failed.' });
    }
  };

  return { handleCreateGameRequest };
}
