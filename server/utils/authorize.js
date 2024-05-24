import jwt from "jsonwebtoken";
// const logger = require("./logger");

export const generateToken = (username) => {
  return jwt.sign({ username }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.TOKEN_LIFETIME,
  });
};

export const authenticateToken = (req, res, next) => {
  const token = req.headers.cookie?.slice(10);
  if (token == null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, username) => {
    // err && logger.warn(err);
    if (err) {
      return res.sendStatus(403);
    }
    req.username = username;
    next();
  });
};
