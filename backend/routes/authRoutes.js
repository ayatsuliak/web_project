const express = require("express");
const router = express.Router();

const { register, login, logout, refresh, getLoggedInUser } = require("../controllers/authController");


router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout).post(logout);
router.route("/refresh").get(refresh);
router.route("/get-logged-in-user").get(getLoggedInUser);

module.exports = router;