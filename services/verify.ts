// Importing necessary modules and types
import { APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from '../utils/utils';
import { verifyToken, VerifyTokenResponse } from '../utils/auth';

// Function to verify a user's token
export const verify = async (requestBody: { user: { userName: string }, token: string }): Promise<APIGatewayProxyResult> => {
  // Check if the request body contains the required properties
  if (!requestBody.user || !requestBody.user.userName || !requestBody.token) {
    return buildResponse(401, {
      message: "Incorrect request body",
    });
  }

  // Extract user and token from the request body
  const { user, token } = requestBody;

  // Verify the token
  const verification: VerifyTokenResponse = await verifyToken(user.userName, token);

  // Check if the token verification was successful
  if (!verification.verified) {
    return buildResponse(401, {
      message: verification.message, // Include verification message in the response
    });
  }

  // Return a successful response with user and token details
  return buildResponse(200, {
    message: "Success",
    user: user,
    token: token,
  });
};