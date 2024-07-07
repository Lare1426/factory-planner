import jwt from "jsonwebtoken";

export const generateToken = (name, id) => {
  return jwt.sign({ user: { name, id } }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.TOKEN_LIFETIME,
  });
};

/**
 * extract username from token else return null
 * @returns {null | string}
 */
export const authenticateToken = (req) => {
  const token = req.headers.cookie?.slice(10);
  if (token == null) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY).user;
  } catch (error) {
    return null;
  }
};

export const authenticateTokenMiddleware = (req, res, next) => {
  const user = authenticateToken(req);

  if (!user) {
    return res.sendStatus(401);
  }
  req.user = user;
  next();
};
