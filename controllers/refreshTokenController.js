require("dotenv").config();

const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {return res.sendStatus(401);}
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.UserInfo.username)
      return res.sendStatus(403);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          user: decoded._id,
          username: decoded.username,
        },
      },
      process.env.SECRET_KEY,
      { expiresIn: "5m" }
    );

    res.json({ accessToken, user: decoded._id});
  });
};
