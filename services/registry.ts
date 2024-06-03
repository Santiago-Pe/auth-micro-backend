// Importing necessary modules and types
import AWS from 'aws-sdk';
import bcrypt from 'bcrypt';
import { APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { buildResponse } from '../utils/utils';

// Configuring AWS SDK
AWS.config.update({
  region: "us-east-2",
});

// Creating a DynamoDB DocumentClient instance
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = "auth-microservices-users";

// Interface for User object
interface User {
  userId: string;
  name: string;
  email: string;
  userName: string;
  password: string;
}
// Function to get a user from DynamoDB
async function getUser(userName: string): Promise<AWS.DynamoDB.DocumentClient.AttributeMap | undefined> {
  const params = {
    TableName: userTable,
    Key: {
      userName: userName,
    },
  };

  try {
    const response = await dynamodb.get(params).promise();
    return response.Item;
  } catch (error) {
    console.error("There is an error getting user:", error);
    return undefined;
  }
}

// Function to save a user to DynamoDB
async function saveUser(user: User): Promise<boolean> {
  const params = {
    TableName: userTable,
    Item: user,
  };

  try {
    await dynamodb.put(params).promise();
    return true;
  } catch (error) {
    console.error("There is an error saving user:", error);
    return false;
  }
}

// Function to register a user
export const register = async (userInfo: User): Promise<APIGatewayProxyResult> => {
  const { name, email, password, userName } = userInfo;

  if (!name || !email || !password || !userName) {
    return buildResponse(401, {
      message: "All fields are required",
    });
  }

  const dynamoUser = await getUser(userName);
  console.info(dynamoUser?.userName)
  if (dynamoUser && dynamoUser.userName) {
    return buildResponse(401, {
      message: "User name already exists in our database. Please choose a different user name",
    });
  }

  const encryptedPW = bcrypt.hashSync(password.trim(), 10);
  const user: User = {
    userId: uuidv4(), 
    name: name,
    email: email,
    userName: userName.toLowerCase().trim(),
    password: encryptedPW,
  };

  const saveUserResponse = await saveUser(user);
  if (!saveUserResponse) {
    return buildResponse(501, {
      message: "Server Error. Please try again later",
    });
  }

  return buildResponse(200, { userName: userName });
};

