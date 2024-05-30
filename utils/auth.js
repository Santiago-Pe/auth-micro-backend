const jwt = require("jsonwebtoken");

function generateToken(userInfo) {
  if (!userInfo) {
    return null;
  }

  return jwt.sign(userInfo, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

function verifyToken(userName, token) {
  return jwt.verify(token, process.env.JWT_SECRET, (err, response) => {
    if (err) {
      return { verified: false, message: "Invalid token" };
    }
    if (response.userName !== userName) {
      return { verified: false, message: "Invalid user" };
    }

    return { verified: true, message: "Verified" };
  });
}

module.exports = generateToken;
module.exports = verifyToken;
