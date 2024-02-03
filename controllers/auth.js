const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Student = require("../models/student");

exports.studentLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let studentDetails = null;
  Student.findOne({ where: { email: email } })
    .then((student) => {
      if (student) {
        studentDetails = student;
        return bcrypt.compare(password, student.password);
      } else {
        return Promise.reject("User not found");
      }
    })
    .then(async (isMatch) => {
      if (isMatch) {
        console.log("Passwords match!");
        const data = {};
        data["studentId"] = studentDetails.id;
        data["batchId"] = studentDetails.batchId;
        const token = await jwt.sign(data, process.env.TOKEN_SECRET_KEY, {
          expiresIn: "1m", // Adjust expiration time as needed
        });
        const refreshToken = await jwt.sign(
          data,
          process.env.REFRESH_SECRET_KEY,
          {
            expiresIn: "30m", // Adjust expiration time as needed
          }
        );

        res.cookie("cuet_access_token", token);
        res.cookie("cuet_refresh_token", refreshToken);

        res.json({
          status: 1,
          data: {
            // student: studentDetails,
            authToken: token,
            refreshToken: refreshToken,
          },
          message: "Logged-in successfully!",
        });
      } else {
        console.log("Incorrect password");
        res.json({
          status: 0,
          data: isMatch,
          message: "Invalid Password",
        });
      }
    })
    .catch((error) => {
      res.json({
        status: 0,
        data: null,
        message: "Student with this email id does not exists!",
      });
      console.error("Error authenticating user:", error);
    });
};

exports.adminLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  if(email === process.env.ADMIN_EMAIL){
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSKEY);
    if(isMatch){
      const data ={};
      data['isAdmin']=true;
      data['email'] = process.env.ADMIN_EMAIL;
      const token = await jwt.sign(data, process.env.ADMIN_SECRET_KEY, {
        expiresIn: "10m", // Adjust expiration time as needed
      });
      const refreshToken = await jwt.sign(
        data,
        process.env.ADMIN_REFRESH_KEY,
        {
          expiresIn: "30m", // Adjust expiration time as needed
        }
      );

      res.cookie("cuet_access_token", token);
      res.cookie("cuet_refresh_token", refreshToken);

      res.json({
        status: 1,
        data: {
          // student: studentDetails,
          authToken: token,
          refreshToken: refreshToken,
        },
        message: "Logged-in successfully!",
      });
    } else {
      res.json({
        status:0,
        data: null,
        message: "Invalid Password"
      })
    }
  } else {
    res.json({
      status:0,
      data:null,
      message:"Invalid Email ID"
    })
  }
}

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  // console.log(token);

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, user) => {
    if (err) {
      let refreshToken =null;
      refreshToken = req.cookies.cuet_refresh_token; // Assuming refresh token in cookie
      console.log(refreshToken);

      if (refreshToken) {
        verifyRefreshToken(refreshToken, (err, refreshUser) => {
          if (err) {
            return res.status(401).json({ message: 'Invalid refresh token' });
          } else {
            // Generate new access and refresh tokens
            const newTokens = generateNewTokens(refreshUser);
            res.cookie('cuet_access_token', newTokens.accessToken, { httpOnly: true }); // Securely store refresh token
            res.cookie('cuet_refresh_token', newTokens.refreshToken, { httpOnly: true }); // Securely store refresh token
            res.json({ accessToken: newTokens.accessToken });
          }
        });
      } else {
        return res.status(401).json({ message: 'Token expired' });
      }
    } else {
      req.user = user;
      // res.json({
      //   status: 1,
      //   data: null,
      //   message: "Authenticated!"
      // })
      next();
    }
  });
}

function verifyRefreshToken(refreshToken, callback) {
  // Replace with your implementation to verify refresh token
  // This could involve checking against a database or using a separate JWT secret key
  // Example:
  jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, refreshUser) => {
    if (err) {
      callback(err);
    } else {
      callback(null, refreshUser); // Valid refresh token returns user data
    }
  });
}

// Implement generateNewTokens function based on your configuration
function generateNewTokens(user) {
  // Generate new access and refresh tokens with appropriate expiry times
  // Example:
  const accessToken = jwt.sign({ user: user.id }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1m' });
  const refreshToken = jwt.sign({ user: user.id }, process.env.REFRESH_SECRET_KEY, { expiresIn: '30m' });
  return { accessToken, refreshToken };
}

exports.authenticateAdminToken = (req, res, next) => {
  console.log('In authentication')
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  // console.log(token);

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.ADMIN_SECRET_KEY, (err, user) => {
    if (err) {
      let refreshToken =null;
      refreshToken = req.cookies.cuet_refresh_token; // Assuming refresh token in cookie
      console.log(refreshToken);

      if (refreshToken) {
        verifyAdminRefreshToken(refreshToken, (err, refreshUser) => {
          if (err) {
            return res.status(401).json({ message: 'Invalid refresh token' });
          } else {
            // Generate new access and refresh tokens
            const newTokens = generateAdminTokens(refreshUser);
            res.cookie('cuet_access_token', newTokens.accessToken, { httpOnly: true }); // Securely store refresh token
            res.cookie('cuet_refresh_token', newTokens.refreshToken, { httpOnly: true }); // Securely store refresh token
            // res.setHeader('Authorization', `Bearer ${newTokens.accessToken}`);
            // res.json({ accessToken: newTokens.accessToken });
            console.log('Authenticated');
            next();
          }
        });
      } else {
        return res.status(401).json({ message: 'Token expired' });
      }
    } else {
      req.user = user;
      console.log('Authenticated');
      next();
    }
  });
}

function verifyAdminRefreshToken(refreshToken, callback) {
  // Replace with your implementation to verify refresh token
  // This could involve checking against a database or using a separate JWT secret key
  // Example:
  jwt.verify(refreshToken, process.env.ADMIN_REFRESH_KEY, (err, refreshUser) => {
    if (err) {
      callback(err);
    } else {
      callback(null, refreshUser); // Valid refresh token returns user data
    }
  });
}

// Implement generateNewTokens function based on your configuration
function generateAdminTokens(user) {
  // Generate new access and refresh tokens with appropriate expiry times
  // Example:
  const accessToken = jwt.sign({ user: user.id }, process.env.ADMIN_SECRET_KEY, { expiresIn: '10m' });
  const refreshToken = jwt.sign({ user: user.id }, process.env.ADMIN_REFRESH_KEY, { expiresIn: '30m' });
  return { accessToken, refreshToken };
}