require("dotenv").config();
const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler');

exports.register = async (req, res, next) => {
  const { username, password } = req.body  

  const errors = [];

  if (username.length < 4 || username.length > 16) {
    errors.push('Username must be between 4 and 16 characters long');
  }

  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    errors.push('Username must contain only letters and numbers');
  }

  if (password.length < 8 || password.length > 16) {
    errors.push('The password must be between 8 and 16 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.status(409).json({ message: "This username has been used already" });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hash
    });

    const accessToken = jwt.sign(
      {
        "UserInfo": {
          "_id": newUser._id,
          "username": newUser.username,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: `${process.env.ACCESS_TOKEN_DURATION}` }
    );

    const refreshToken = jwt.sign(
      { "username": newUser.username, "password": newUser.password },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: `${process.env.REFRESH_TOKEN_DURATION}` }
    );

    const age = +((process.env.REFRESH_TOKEN_DURATION).slice(0, -1));  
    
    res.cookie('accessToken', accessToken, {
      secure: true,
      sameSite: 'None',
      httpOnly: false, 
      maxAge: age * 24 * 60 * 60 * 1000,
    });

    res.cookie('jwt', refreshToken, {
      secure: true,
      sameSite: 'None',
      httpOnly: true,
      maxAge: age * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "User created successfully",
      user: {
        username: newUser.username,
        userId: newUser._id,
      },
      accessToken: accessToken,
      redirect: '/create-task.html' 
    });
  } catch (error) {
    res.status(400).json({
      message: "User was not created",
      error: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  const errors = [];

  if (username.length < 4 || username.length > 16) {
    errors.push('Username must be between 4 and 16 characters long');
  }

  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    errors.push('Username must contain only letters and numbers');
  }

  if (password.length < 8 || password.length > 16) {
    errors.push('The password must be between 8 and 16 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.status(401).json({
        message: `${username} account was not found`,
      });
    }

    bcrypt.compare(password, foundUser.password, (err, result) => {
      if (err || !result) {
        return res.status(401).json({
          message: "Incorrect username or password",
        });
      }

      const accessToken = jwt.sign(
        {
          "UserInfo": {
            "_id": foundUser._id,
            "username": foundUser.username,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: `${process.env.ACCESS_TOKEN_DURATION}` }
      );

      const refreshToken = jwt.sign(
        { "username": foundUser.username, "password": foundUser.password },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: `${process.env.REFRESH_TOKEN_DURATION}` }
      );

      const age = +((process.env.REFRESH_TOKEN_DURATION).slice(0, -1));  
      
      res.cookie('accessToken', accessToken, {
        secure: true,
        sameSite: 'None',
        httpOnly: false, 
        maxAge: age * 24 * 60 * 60 * 1000,
      });

      res.cookie('jwt', refreshToken, {
        secure: true,
        sameSite: 'None',
        httpOnly: true,
        maxAge: age * 24 * 60 * 60 * 1000,
      });
      
      res.status(200).json({
        message: "Login successful",
        user: {
          username: foundUser.username,
          userId: foundUser._id,
        },
        accessToken: accessToken,
        redirect: '/create-task.html'
      });
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.refresh = (req, res) => {
  const cookies = req.cookies

  if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

  const refreshToken = cookies.jwt

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Forbidden' })
    
      const foundUser = await User.findOne({ username: decoded.username }).exec()

      if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

      const accessToken = jwt.sign(
        {
          "UserInfo": {
            "_id": foundUser._id,
            "username": foundUser.username,
            "password": foundUser.password
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: `${process.env.ACCESS_TOKEN_DURATION}`}
      )

      res.json({ accessToken })
    })
  )
}

exports.logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(204).json({ message: 'No cookie to clear' });

  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  res.status(200).json({ message: 'Cookie cleared', redirect: '/login.html' });
};

exports.getLoggedInUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const userId = payload.UserInfo._id;

    const user = await User.findById(userId);

    if (user) {
      return res.status(200).json({
        username: user.username,
        id: user._id,
      });
    } else {
      return res.status(401).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(401).json({ message: "User not authenticated" });
  }
}
 