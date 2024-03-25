import jwt from "jsonwebtoken";
// const logger = require("./logger");

const generateToken = (username) => {
  return jwt.sign({ username }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.TOKEN_LIFETIME,
  });
};

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    // err && logger.warn(err);

    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;

    next();
  });
}

module.exports = { generateToken, authenticateToken };
