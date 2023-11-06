const express = require("express");
const session = require('express-session');
const router = express.Router();
const app = express();
const { ACCESS_TOKEN_SECRET } = process.env.ACCESS_TOKEN_SECRET;

const { register, login, logout, refresh, getLoggedInUser } = require("../controllers/authController");


router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout).post(logout);
router.route("/refresh").get(refresh);
router.route("/get-logged-in-user").get(getLoggedInUser);

app.use(session({
    secret: ACCESS_TOKEN_SECRET,
    resave: false,
    saveUninitialized: true,
}));

module.exports = router;