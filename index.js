const registerServices = require("./services/register");
const loginServices = require("./services/login");
const verifyServices = require("./services/verify");
const utils = require("./utils/utils");
/* ---------- Paths ---------- */
const healthPath = "/health";
const registerPath = "/register";
const loginPath = "/login";
const verifyPath = "/verify";

/* ---------- Main Function ---------- */
export const handler = async (event) => {
  console.log("Request Event", event);
  let response;

  switch (true) {
    case event.httpMethod === "GET" && event.path === healthPath:
      response = utils.buildResponse(200, { message: "Health check passed" });
      break;
    case event.httpMethod === "POST" && event.path === registerPath:
      const registerBody = JSON.parse(event.body);
      response = await registerServices.register(registerBody);
      break;
    case event.httpMethod === "POST" && event.path === loginPath:
      const loginBody = JSON.parse(event.body);
      response = await loginServices.login(loginBody);
      break;
    case event.httpMethod === "POST" && event.path === verifyPath:
      const verifyBody = JSON.parse(event.body);
      response = await verifyServices.verify(loginBody);
      break;
    default:
      response = utils.buildResponse(404, { error: "404 Not Found" });
  }

  return response;
};
