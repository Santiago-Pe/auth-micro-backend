// Importing the necessary type from the AWS Lambda types package to ensure type safety for API Gateway responses
import { APIGatewayProxyResult } from 'aws-lambda';

// Function to build a response for AWS API Gateway
// It takes a status code (number) and a body (object with string keys and unknown values)
export const buildResponse = (statusCode: number, body: Record<string, unknown>): APIGatewayProxyResult => {
  // Return an object that conforms to the APIGatewayProxyResult interface
  return {
    statusCode, // HTTP status code
    headers: {
      "Access-Control-Allow-Origin": "*", // Allow CORS for all origins
      "Content-Type": "application/json"   // Specify that the response content type is JSON
    },
    body: JSON.stringify(body), // Convert the response body to a JSON string
  };
};
