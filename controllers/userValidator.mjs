// UserValidator controller handles the user validation from the cookies,
// along with login/signup/logout requests .

import generatedHashedValue from '../hashGenerator.mjs';
/**
 * Function that exports the userValidator controller function.
  * @param dbModels - dbModels
 */
export default function userValidator(dbModels) {
/**
 * This function validates the session, by checking the cookie values.
 * If cookies don't match, it will return false, else true.
 * @param loggedInSession - Logged in details from the cookies
 * @param userEmail - email of the user which is used to login
 */
  const validateSessionUserByCookies = (loggedInSession, userEmail) => {
    console.log('validateSessionUserByCookies');
    if (loggedInSession === undefined || userEmail === undefined)
    {
      console.log('validateSessionUserByCookies - undefined values');
      return false;
    }
    // create hashed value for the user email provided.
    const hashedUserInfo = generatedHashedValue(userEmail, true);
    if (hashedUserInfo !== loggedInSession)
    {
    // Already logged in user is different
      console.log('validateSessionUserByCookies - hashed value is not matching: ', `hashedUserInfo: ${hashedUserInfo}`, `loggedInSession: ${loggedInSession}`);
      return false;
    }
    // If hashedUserInfo === loggedInSession, same user is already logged in
    console.log('validateSessionUserByCookies - success');
    return true;
  };

  /**
   * This function validates the given user name against the data retrieved from the database
   * Also, sends the cookie also along with response
   * @param loginData - email & password specified in the login request
   * @param userData - user data retrieved from the database
   * @param response - to send HTTP response
   */
  const validateAndLoginUser = (loginData, userData, response) => {
    console.log(userData);
    console.log(userData.email);
    // Get the hashed value of the user provided password
    const hashedInputPassword = generatedHashedValue(loginData.password, false);
    // If the user's hashed password in the database does not
    // match the hashed input password, login fails
    if (userData.password !== hashedInputPassword) {
    // the error for incorrect email and incorrect password are the same for security reasons.
    // This is to prevent detection of whether a user has an account for a given service.
      response.status(300).send({ success: false, message: 'Login failed!' });
    }
    // Set the cookies and send the response
    // create an unhashed cookie string based on user ID and salt
    const hashedCookieString = generatedHashedValue(loginData.email, true);
    response.cookie('loggedInSession', hashedCookieString);
    response.cookie('userInfo', loginData.email);
    response.status(200).send({ success: true, message: 'Logged-in successfully!!', userName: loginData.email });
  };

  /**
   * Function that searches for the specified user in the request
   * @param request
   * @param response
   */
  const findUser = async (email, request, response) => {
    try {
      request.userInfo = await dbModels.User.findOne({
        where: { email },
      });
      console.log(`Returned user: ${request.userInfo}`);
    }
    catch (error)
    {
      console.log(error);
      // throw error;
      response.status(300).send({ success: false, message: 'User not found. Please signup', error });
    }
    request.isUserLoggedIn = true;
  };

  /**
   * Function to check whether the request is an authenticated user or not
   *
   * @param request - HTTP request object received
   * @param response - HTTP response object
   * @param next - represents the next function to be called.
   */
  const authenticateRequestUsingCookies = async (request, response, next) => {
    console.log('authenticateRequestUsingCookies');
    // set the default value
    request.isUserLoggedIn = false;

    // Validate the session is logged in or not using cookies
    const { loggedInSession, userInfo } = request.cookies;

    console.log(`request.cookies:  ${loggedInSession}, ${userInfo}`);

    if (loggedInSession === '' && userInfo === '')
    {
      console.log('authenticateRequestUsingCookies - not logged in');
      // throw new Error('Please login or signup');
      response.status(300).send({ success: false, message: 'Please login or signup' });
    }
    if (validateSessionUserByCookies(loggedInSession, userInfo))
    {
    // look for this user in the database
      try {
        await findUser(userInfo, request, response);
        next();
      } catch (error) {
        console.log('authenticateRequestUsingCookies - User not found');
        // throw new Error('User not found');
        response.status(300).send({ success: false, message: 'User not found. Please signup', error });
      }
    }
    else {
      console.log('validateSessionUserByCookies failed');
      next();
    }
    return '';
  };

  /**
   * Function that handles the login request.
   * If the user is not already registered it will ask for confirmation to create a new user,
   * @param request - http request
   * @param response http response
   */
  const handleLoginRequest = async (request, response) => {
    console.log('handleLoginRequest');
    const loginData = { email: request.body.email, password: request.body.password };
    console.log(`loginData: ${loginData.email}, ${loginData.password}`);
    try {
      console.log(dbModels.User);
      await findUser(loginData.email, request, response);
      if (request.userInfo === null || request.userInfo === undefined)
      {
        response.status(300).send({ success: false, message: 'User not found. Please signup' });
      }
      // Once the user data is retrieved from database,
      // validate it with the given user name and password
      validateAndLoginUser(loginData, request.userInfo, response);
    }
    catch (error)
    {
      console.log(error);
      // throw new Error('User not found. Please Sign-up');
      response.status(300).send({ success: false, message: 'User not found. Please signup', error });
    }
  };

  return {
    authenticateRequestUsingCookies, handleLoginRequest,
  };
}
