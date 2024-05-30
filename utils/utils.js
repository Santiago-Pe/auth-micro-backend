function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body), // Mover 'body' fuera de los headers
  };
}

module.exports.buildResponse = buildResponse;
