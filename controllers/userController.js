require("dotenv").config();

const User = require("../models/User");
const { body, validationResult, check } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//create user
exports.user_create = [
  body("username")
    .trim()
    .escape()
    .isLength({ min: 3 })
    .custom((value) => {
      return User.findOne({ username: value }).then((user) => {
        if (user) {
          return Promise.reject("username already in use");
        }
      });
    }),
  body("password").isLength({ min: 6 }),
  body("passwordConfirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ username: req.body.username, errors: errors.array() });
    } else {
      let user = new User({
        username: req.body.username,
        password: req.body.password,
      });
      //password encryption
      bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(req.body.password, salt, async function (err, hash) {
          if (err) return next(err);
          user.password = hash;
          try {
            await user.save();
            res.status(200).json(user);
          } catch (err) {
            res.status(500).json({ message: err.message });
          }
        });
      });
    }
  },
];

exports.user_login = [
  //sanitizing username input

  body("username").trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ username: req.body.username, errors: errors.array() });
    } else {
      //searching for the user
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        res.status(404).json({ message: "User does not exist" });
      } else {
        //checking password
        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
          res.status(401).json({ message: "Invalid password" });
        } else {
          //user is found and password is correct, returning the token
          const accessToken = jwt.sign(
            {
              UserInfo: {
                user: user._id,
                username: user.username,
              },
            },
            process.env.SECRET_KEY,
            { expiresIn: "5m"}
          );

          const refreshToken = jwt.sign(
            {
              UserInfo: {
                user: user._id,
                username: user.username,
              },
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "1d"}
          );
          user.refreshToken = refreshToken;
          const result = await user.save();
          
          res.cookie('jwt', refreshToken, { secure: true, httpOnly: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
          res.json({accessToken});
        }
      }
    }
  },
];

exports.user_logout = async (req, res) => {
  //takes care of refresh token
  //still need to delete accesstoken on the client
  const cookies = req.cookies;
  if (!cookies?.jwt) {return res.sendStatus(204);} 
  const refreshToken = cookies.jwt;

  // look up refreshtoken in the db
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt")
    return res.sendStatus(204);
  }

  //delete refreshtoken

  User.findByIdAndUpdate(foundUser._id, {refreshToken: ""}, (err, result) => {
    if (err) {
      res.json({err})
    }
    else {
      res.json({msg: "success!"})
    }
  })
};
