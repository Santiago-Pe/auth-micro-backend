const AWS = require("aws-sdk");
const utils = require("../utils/utils");
const bcrypt = require("bcrypt");
const auth = require("../utils/auth");

AWS.config.update({
  region: "us-east-2",
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = "auth-microservices-users";

async function getUser(userName) {
  const params = {
    tableName: userTable,
    key: {
      userName: userName,
    },
  };
  return await dynamodb
    .get(params)
    .promise()
    .then(
      (response) => {
        return response.Item;
      },
      (error) => {
        console.error("There is an error getting user:", error);
      }
    );
}

async function login(user) {
  const userName = user.userName;
  const password = user.password;

  if (!user || !userName || !password) {
    return utils.buildResponse(401, {
      message: "User name and pasword are required",
    });
  }

  const dynamoUser = await getUser(userName).toLowerCase().trim();

  if (!dynamoUser || dynamoUser.userName) {
    return utils.buildResponse(403, { message: "User does not exist" });
  }
  if (!bcrypt.compareSync(password, dynamoUser.password)) {
    return utils.buildResponse(403, { message: "Password is incorrect" });
  }

  const userInfo = {
    userName: dynamoUser.userName,
    name: dynamoUser.name,
  };

  const token = auth.generateToken(userInfo);
  const response = {
    user: userInfo,
    token: token,
  };

  return utils.buildResponse(200, response);
}

module.exports.login = login;
