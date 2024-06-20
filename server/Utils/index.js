const jwt = require("jsonwebtoken");
const config = require("config");
const multer = require("multer");

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

// Configure multer disk storage for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}`);
  },
});

const upload = multer({ storage: storage }).single("");

module.exports = { auth, upload };
