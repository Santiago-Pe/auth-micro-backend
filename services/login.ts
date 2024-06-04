// Importing necessary modules and types
import AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import bcrypt from 'bcrypt';
import { APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from '../utils/utils';
import { generateToken } from '../utils/auth';

// Configuring AWS SDK
AWS.config.update({
  region: "us-east-2",
});

// Creating a DynamoDB DocumentClient instance
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = "auth-microservices-users";

// Interface for User object
interface User {
  userName: string;
  password: string;
}

// Function to get all keys from DynamoDB
async function getAllKeys(): Promise<DocumentClient.AttributeMap[] | undefined> {
  const params: DocumentClient.ScanInput = {
    TableName: userTable,
    ProjectionExpression: "userId, userName, email", // Ajusta esto según las claves de tu tabla
  };

  try {
    const allKeys: DocumentClient.AttributeMap[] = [];
    let items;
    do {
      items = await dynamodb.scan(params).promise();
      if (items.Items) {
        allKeys.push(...items.Items);
      }
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");

    console.info('All keys:', allKeys);
    return allKeys;
  } catch (error) {
    console.error("There is an error scanning the table:", error);
    return undefined;
  }
}

// Function to get a user from DynamoDB
async function getUser(userName: string): Promise<DocumentClient.AttributeMap | undefined> {
  const params: DocumentClient.QueryInput = {
    TableName: userTable,
    IndexName: "userName-index",
    KeyConditionExpression: "userName = :userName",
    ExpressionAttributeValues: {
      ":userName": userName,
    },
  };

  try {
    const response = await dynamodb.query(params).promise();
    console.info('USER_NAME from getUserByUserName()', response)
    return response.Items && response.Items.length > 0 ? response.Items[0] : undefined;
  } catch (error) {
    console.error("There is an error getting user by userName:", error);
    return undefined;
  }
}

// Function to log in a user
export const login = async (user: User): Promise<APIGatewayProxyResult> => {
  const { userName, password } = user;

  if (!userName || !password) {
    return buildResponse(401, {
      message: "Username and password are required",
    });
  }

  const allKeys = await getAllKeys();
  if (!allKeys) {
    return buildResponse(500, { message: "Internal server error" });
  }

  const dynamoUser = allKeys.find(item => item.userName === userName);
  if (!dynamoUser || !dynamoUser.userName) {
    return buildResponse(403, { message: "User does not exist" });
  }

  if (!bcrypt.compareSync(password, dynamoUser.password)) {
    return buildResponse(403, { message: "Password is incorrect" });
  }

  const userInfo = {
    userName: dynamoUser.userName,
    name: dynamoUser.name,
  };

  const token = generateToken(userInfo);
  const response = {
    user: userInfo,
    token: token,
  };

  return buildResponse(200, response);
};
