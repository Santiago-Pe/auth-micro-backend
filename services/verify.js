const utils = require("../utils/utils");
const auth = require("../utils/utils");
function verify(requestBody) {
  if (!requestBody.user || !requestBody.user.userName || !requestBody.token) {
    return utils.buildResponse(401, {
      verified: false,
      message: "Incorrect request body",
    });
  }

  const user = requestBody.user;
  const token = requestBody.token;
  const verification = auth.verifyToken(user.userName, token);

  if (!verification.verified) {
    return utils.buildResponse(401, verification);
  }

  return utils.buildResponse(200, {
    verified: true,
    message: "Success",
    user: user,
    token: token,
  });
}

module.exports.verify = verify;
