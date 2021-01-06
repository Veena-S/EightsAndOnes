import generatedHashedValue from '../hashGenerator.mjs';

// This controller file handles the requests meant for Users table
/**
 * Exported function that handles different requestes related to Users table
 * @param dbModels - Object that holds all the models created to represent the db tables
 */
export default function users(dbModels) {
  /**
   *
   * @param request - HTTP request object received through the routes.mjs
   * @param response - HTTP response object received through the routes.mjs
   *                 - To send response back
   *
   * Function that renders the home page
   */
  const createNewUser = ((request, response) => {
    console.log('createNewUser');
    const { email, password } = request.body;
    const hashedPassword = generatedHashedValue(password, false);

    console.log(`Request: ${email}, ${password}, Hashed Password: ${hashedPassword}`);
    dbModels.User.create({ email, password: hashedPassword })
      .then((newUser) => {
        const newUserData = newUser.toJSON();
        console.log(newUserData);
        // TO DO: Set Cookies
        response.send({ success: true, newUserData });
      })
      .catch((err) => {
        console.log(err);
        response.send({ success: false, err }); });
  });

  /**
   * Function to get the details of user specified in the email id
   * @param request - HTTP request
   * @param response - HTTP response
   */
  const getUserByEmail = async (request, response) => {
    console.log('getUserByEmail');
    try {
      try {
        const userData = await dbModels.User.findOne({
          where: { email: request.body.email },
        });
        console.log(`Returned user: ${userData}`);
        response.send(userData);
      }
      catch (error)
      {
        console.log(error);
        response.send({ message: 'User not found', error });
      }
    }
    catch (error)
    {
      console.log(error);
      response.send(error);
    }
  };

  /**
   * Function reads all the data from the Users table and send the JSON converted data as reposnse
   * @param request - http request
   * @param response - http response
   */
  const getAllUsers = (request, response) => {
    console.log('getAllUsers');
    dbModels.User.findAll({
      attributes: ['id', 'email'],
    })
      .then((returnedUsers) => {
        // console.log(returnedUsers.toJSON());
        // response.send(returnedUsers.toJSON());
        response.json(returnedUsers);
      })
      .catch((err) => {
        console.log(err);
        response.send(err);
      });
  };

  // The users() function wil return the functions defined
  return {
    createNewUser, getAllUsers, getUserByEmail,
  };
}
