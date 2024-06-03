import jwt from "jsonwebtoken";

export const generateToken = (username) => {
  return jwt.sign({ username }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.TOKEN_LIFETIME,
  });
};

/**
 * extract username from token else return null
 * @returns {null | string}
 */
export const auhtenticateToken = (req) => {
  const token = req.headers.cookie?.slice(10);
  if (token == null) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY).username;
  } catch (error) {
    return null;
  }
};

export const authenticateTokenMiddleware = (req, res, next) => {
  const username = auhtenticateToken(req);

  if (!username) {
    return res.sendStatus(401);
  }
  req.username = username;
  next();
};
