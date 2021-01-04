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
export default function tokens(db) {
  /**
   *
   * @param request - HTTP request
   * @param response - HTTP response
   */
  const handleGetAllTokensRequest = (request, response) => {
    db.GameToken.findAll()
      .then((returnedTokens) => {
        console.log(returnedTokens);
        response.json(returnedTokens);
      })
      .catch((err) => {
        console.log(err);
        response.send(err);
      });
  };

  return { handleGetAllTokensRequest };
}
