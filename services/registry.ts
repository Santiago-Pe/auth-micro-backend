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
// Function to get a user by userName from DynamoDB
async function getUserByUserName(userName: string): Promise<AWS.DynamoDB.DocumentClient.AttributeMap | undefined> {
  const params = {
    TableName: userTable,
    IndexName: "userName-index",
    KeyConditionExpression: "userName = :userName",
    ExpressionAttributeValues: {
      ":userName": userName,
    },
  };

  try {
    const response = await dynamodb.query(params).promise();
    console.info(response)
    return response.Items && response.Items.length > 0 ? response.Items[0] : undefined;
  } catch (error) {
    console.error("There is an error getting user by userName:", error);
    return undefined;
  }
}

// Function to get a user by email from DynamoDB
async function getUserByEmail(email: string): Promise<AWS.DynamoDB.DocumentClient.AttributeMap | undefined> {
  const params = {
    TableName: userTable,
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };

  try {
    const response = await dynamodb.query(params).promise();
    return response.Items && response.Items.length > 0 ? response.Items[0] : undefined;
  } catch (error) {
    console.error("There is an error getting user by email:", error);
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

  const existingUserByUserName = await getUserByUserName(userName);
   console.log(existingUserByUserName)
  if (existingUserByUserName) {
    return buildResponse(401, {
      message: "User name already exists in our database. Please choose a different user name",
    });
  }

  const existingUserByEmail = await getUserByEmail(email);
 
  if (existingUserByEmail) {
    return buildResponse(401, {
      message: "Email already exists in our database. Please choose a different email",
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

