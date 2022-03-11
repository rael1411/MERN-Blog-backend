const passport = require("passport");
const jwt = require("jsonwebtoken");
require("dotenv").config()
const bcrypt = require("bcrypt");
const User = require("./models/User")