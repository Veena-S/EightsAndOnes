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
  const handleCreateGameRequest = (request, response) => {
    /**
     * boardSize = size of the board to be created
     * playerTokenArray = An array of objects that holds info on players and their selected tokens
     */
    const { boardSize, playerTokenArray } = request.body;
    console.log(boardSize);
    console.log(playerTokenArray);
  };

  return { handleCreateGameRequest };
}
