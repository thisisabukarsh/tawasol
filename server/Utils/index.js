const jwt = require("jsonwebtoken");
const config = require("config");

/*
Middleware to authenticate requests using JWT
This middleware checks for a token in the request header ("x-auth-token").
If the token is present and valid, it decodes the token and attaches the user info to the request object.
*/
const auth = (req, res, next) => {
  //get the token from the request header
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  try {
    jwt.verify(token, config.get("jwtSecretToken"), (err, decoded) => {
      if (err) {
        return res.status(401).json({ msg: "No token, authorization denied" });
      } else {
        req.user = decoded.user;
        next();
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = { auth };
