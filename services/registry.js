const AWS = require("aws-sdk");
const utils = require("../utils/utils");
const bcrypt = require("bcrypt");
const { response } = require("express");

AWS.config.update({
  region: "us-east-2",
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = "auth-microservices-users";

async function register(userInfo) {
  const name = userInfo.name;
  const email = userInfo.email;
  const password = userInfo.password;
  const userName = userInfo.password;

  if (!name || !email || !password || !userName) {
    return utils.buildResponse(401, {
      message: "All fields are required",
    });
  }

  const dynamoUser = await getUser(userName);
  if (dynamoUser && dynamoUser.userName) {
    return utils.buildResponse(401, {
      message:
        "User name already exists in our database. Please choose a different user name",
    });
  }

  const encryptedPW = bcrypt.hashSync(password.trim(), 10);
  const user = {
    name: name,
    email: email,
    userName: userName.toLowerCase().trim(),
    password: encryptedPW,
  };

  const saveUserResponse = await saveUser(user);
  if (!saveUserResponse) {
    return utils.buildResponse(501, {
      message: "Server Error. Please try again later",
    });
  }

  return utils.buildResponse(200, { userName: userName });
}

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
async function saveUser(user) {
  const params = {
    tableName: userTable,
    item: user,
  };
  return await dynamodb
    .put(params)
    .promise()
    .then(
      () => {
        return true;
      },
      (error) => {
        console.error("There is an error saving user:", error);
      }
    );
}

// Suggested code may be subject to a license. Learn more: ~LicenseLog:1295460998.
module.exports.register = register;
