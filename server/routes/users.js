const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

/* 
api/users/register
register a user
public api
*/
router.post(
  "/register",
  check("name", "Name is required").notEmpty(),
  check("email", "please include a valid Email").isEmail(),
  check(
    "password",
    "please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      user = new User({
        name,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecretToken"),
        { expiresIn: "5 days" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send(error.message);
    }
  }
);

/*
api/users/login
login a user
public
*/
router.post(
  "/login",
  check("email", "please include a valid Email").isEmail(),
  check(
    "password",
    "please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecretToken"),
        { expiresIn: "5 days" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send(error.message);
    }
  }
);

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

/*
api/users/
takes token return a user info
privet
*/
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

module.exports = router;
