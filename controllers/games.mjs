/**
 *
 * Controller helper functions
 */
const DICE_COUNT = 4;
const rollDiceSticks = function () {
  const maxSize = 1;
  const rolledValues = [];
  for (let index = 0; index < DICE_COUNT; index += 1)
  {
    rolledValues.push((Math.floor(Math.random() * maxSize)) + 1);
  }
  return rolledValues;
};

/**
 * Function that identifies the 4 entry points and the centre point
 * @param boardSize - Size of the board in the current game
 *
 * Example: n x n; n=5
 *
 * --------|---------|---------|----------|-------------|
 * 0,0     | 0,1     | 0,2     | 0,3      | 0,(n-1)     |
 * --------|---------|---------|----------|-------------|
 * 1,0     | 1,1     | 1,2     | 1,3      | 1,(n-1)     |
 * --------|---------|---------|----------|-------------|
 * 2,0     | 2,1     | 2,2     | 2,3      | 2,(n-1)     |
 * --------|---------|---------|----------|-------------|
 * 3,0     | 3,1     | 3,2     | 3,3      | 3,(n-1)     |
 * --------|---------|---------|----------|-------------|
 * (n-1),0 | (n-1),1 | (n-1),2 | (n-1),3  | (n-1),(n-1) |
 * --------|---------|---------|----------|-------------|
 *
 *
 *   (0,0)        -->   (0, (n-1)/2)       -->  (0, n-1)
 *
 *   ((n-1)/2, 0) -->  ((n-1)/2, (n-1)/2)  --> (n-1)/2, (n-1)
 *
 *   (n-1, 0)     -->  ((n-1), (n-1)/2)    --> (n-1), (n-1)
 */
const findBoardCornersAndEntryPositions = (boardSize) => {
  const topLeftPos = [0, 0];
  const topCentrePos = [0, (boardSize - 1) / 2]; // Entry point
  const topRightPos = [0, boardSize - 1];

  const leftCentrePos = [(boardSize - 1) / 2, 0]; // Entry point
  const centrePos = [(boardSize - 1) / 2, (boardSize - 1) / 2]; // Final Position
  const rightCentrePos = [(boardSize - 1) / 2, (boardSize - 1)]; // Entry point

  const bottomLeftPos = [(boardSize - 1), 0];
  const bottomCentrePos = [(boardSize - 1), (boardSize - 1) / 2]; // Entry Point
  const bottomRightPos = [(boardSize - 1), (boardSize - 1)];

  return {
    topLeftPos,
    topCentrePos,
    topRightPos,
    leftCentrePos,
    centrePos,
    rightCentrePos,
    bottomLeftPos,
    bottomCentrePos,
    bottomRightPos,
  };
};

/**
 * Function that checks whether the current cell is a safe sell or not
 * @param currentCellPos - cell to be verified. [row, col]
 * @param BoardCornersAndSafePos - Positions calcualted in the function
 *                                findBoardCornersAndEntryPositions
 */
const isSafeCellPos = (currentCellPos, BoardCornersAndSafePos) => {
  const currentCellPosString = currentCellPos.toString();
  if ((currentCellPosString === BoardCornersAndSafePos.topCentrePos.toString())
  || (currentCellPosString === BoardCornersAndSafePos.leftCentrePos.toString())
  || (currentCellPosString === BoardCornersAndSafePos.bottomCentrePos.toString())
  || (currentCellPosString === BoardCornersAndSafePos.rightCentrePos.toString())
  || (currentCellPosString === BoardCornersAndSafePos.centrePos.toString()))
  {
    return true;
  }
  return false;
};

/**
 * Function return true if the cell specified is at the centre cell. i.e. final position
 * @param currentCellPos - current position of a token
 * @param BoardCornersAndSafePos
 */
const isCentreCell = (currentCellPos, BoardCornersAndSafePos) => {
  const currentCellPosString = currentCellPos.toString();
  if ((currentCellPosString === BoardCornersAndSafePos.centrePos.toString()))
  {
    return true;
  }
  return false;
};

/**
 * Function that checks whether the next cell should be inner loop starting point
 * It should also be able to identify the current index of loop
 *
 * @param currentCellPos - current position of a token
 * @param entryPoint - specify the entry point of that token
 */
const isNextCellInnerLoopStart = (currentCellPos, entryPoint) => {
// To DO:
};

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
    const { boardSize, playerTokenArray, playersList } = request.body;
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
