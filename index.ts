// Importing necessary types and modules
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'; // Types for AWS Lambda events and responses
import * as registerServices from './services/registry'; // Importing register services
import * as loginServices from './services/login'; // Importing login services
import * as verifyServices from './services/verify'; // Importing verify services
import * as utils from './utils/utils'; // Importing utility functions

/* ---------- Paths ---------- */
// Defining the API paths as constants for better maintainability and readability
const healthPath = "/health";
const registerPath = "/register";
const loginPath = "/login";
const verifyPath = "/verify";

/* ---------- Main Function ---------- */
// The handler function for AWS Lambda
// It takes an APIGatewayEvent as input and returns a promise of an APIGatewayProxyResult
export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log("Request Event", event); // Logging the incoming event for debugging purposes
  let response: APIGatewayProxyResult; // Variable to hold the response

  try {
    // Using a switch-case structure to handle different API paths and methods
    switch (true) {
      case event.httpMethod === "GET" && event.path === healthPath:
        // Handling health check endpoint
        response = utils.buildResponse(200, { message: "Health check passed" });
        break;
      case event.httpMethod === "POST" && event.path === registerPath:
        // Handling user registration
        const registerBody = JSON.parse(event.body!); // Parsing the request body, non-null assertion operator used
        response = await registerServices.register(registerBody); // Calling the register service
        break;
      case event.httpMethod === "POST" && event.path === loginPath:
        // Handling user login
        const loginBody = JSON.parse(event.body!); // Parsing the request body, non-null assertion operator used
        response = await loginServices.login(loginBody); // Calling the login service
        break;
      case event.httpMethod === "POST" && event.path === verifyPath:
        // Handling token verification
        const verifyBody = JSON.parse(event.body!); // Parsing the request body, non-null assertion operator used
        response = await verifyServices.verify(verifyBody); // Calling the verify service
        break;
      default:
        // Handling unknown paths
        response = utils.buildResponse(404, { error: "404 Not Found" });
    }
  } catch (error) {
    // Error handling
    console.error("Error handling request", error); // Logging the error
    response = utils.buildResponse(500, { error: "Internal Server Error" }); // Returning a 500 error response
  }

  return response; // Returning the response
};
