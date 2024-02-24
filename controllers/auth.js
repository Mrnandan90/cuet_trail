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
        data["isAdmin"] = false;
        const token = jwt.sign(data, process.env.TOKEN_SECRET_KEY, {
          expiresIn: "1m",
        });
        const refreshToken = await jwt.sign(
          data,
          process.env.REFRESH_SECRET_KEY,
          {
            expiresIn: "10d",
          }
        );

        res.cookie("cuet_access_token", token, { httpOnly: false });
        res.cookie("cuet_refresh_token", refreshToken, { httpOnly: false });

        // res.cookie('cuet_access_token', token, {
        //   maxAge: 0, // Expires when browser session ends (tab close)
        //   // secure: true, // Set only over HTTPS for enhanced security (recommended)
        //   httpOnly: true, // Prevents JavaScript access for added protection
        //   sameSite: 'strict', // Enforces stricter origin policies for further security
        // });
        // res.cookie('cuet_refresh_token', refreshToken, {
        //   maxAge: 0, // Expires when browser session ends (tab close)
        //   // secure: true, // Set only over HTTPS for enhanced security (recommended)
        //   httpOnly: true, // Prevents JavaScript access for added protection
        //   sameSite: 'strict', // Enforces stricter origin policies for further security
        // });

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
        res.status(400).json({
          status: 0,
          data: isMatch,
          message: "Invalid Password",
        });
      }
    })
    .catch((error) => {
      res.status(400).json({
        status: 0,
        data: null,
        message: "Student with this email id does not exists!",
      });
      console.error("Error authenticating user:", error);
    });
};

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // console.log(token);

  if (!token && !req.cookies.cuet_refresh_token) {
    return res
      .status(401)
      .json({ status: 0, data: null, message: "Unauthorized" });
  }

  jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, user) => {
    if (err) {
      // let refreshToken = null;
      // refreshToken = req.cookies.cuet_refresh_token; // Assuming refresh token in cookie
      // // console.log(refreshToken);

      // if (refreshToken) {
      //   verifyRefreshToken(refreshToken, (err, refreshUser) => {
      //     if (err) {
      //       return res.status(401).json({ status: 0, data: null, message: "Please login again!", redirect:true });
      //     } else {
      //       // Generate new access and refresh tokens
      //       const newTokens = generateNewTokens(refreshUser);
      //       res.cookie("cuet_access_token", newTokens.accessToken, {
      //         httpOnly: false,
      //       }); // Securely store access token
      //       res.cookie("cuet_refresh_token", newTokens.refreshToken, {
      //         httpOnly: false,
      //       }); // Securely store refresh token
      //       req.user = refreshUser;
      //       next();
      //     }
      //   });
      // } else {
      //   return res
      //     .status(401)
      //     .json({
      //       status: 0,
      //       data: null,
      //       message: "Token expired",
      //       redirect: true,
      //     });
      // }
      res.status(401).json({
        status: 0,
        data: null,
        message: "Token expired!",
      });
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
};

function verifyRefreshToken(refreshToken, callback) {
  // Replace with your implementation to verify refresh token
  // This could involve checking against a database or using a separate JWT secret key
  // Example:
  jwt.verify(
    refreshToken,
    process.env.REFRESH_SECRET_KEY,
    (err, refreshUser) => {
      if (err) {
        callback(err);
      } else {
        callback(null, refreshUser); // Valid refresh token returns user data
      }
    }
  );
}

// Implement generateNewTokens function based on your configuration
function generateNewTokens(user) {
  // Generate new access and refresh tokens with appropriate expiry times
  // Example:
  const data = {};
  data["studentId"] = user.studentId;
  data["batchId"] = user.batchId;
  const accessToken = jwt.sign(data, process.env.TOKEN_SECRET_KEY, {
    expiresIn: "10m",
  });
  const refreshToken = jwt.sign(data, process.env.REFRESH_SECRET_KEY, {
    expiresIn: "10d",
  });
  // console.log(user);
  return { accessToken, refreshToken };
}

exports.adminLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === process.env.ADMIN_EMAIL) {
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSKEY);
    if (isMatch) {
      const data = {};
      data["isAdmin"] = true;
      data["email"] = process.env.ADMIN_EMAIL;
      const token = await jwt.sign(data, process.env.ADMIN_SECRET_KEY, {
        expiresIn: "10m", // Adjust expiration time as needed
      });
      const refreshToken = await jwt.sign(data, process.env.ADMIN_REFRESH_KEY, {
        expiresIn: "10d", // Adjust expiration time as needed
      });

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
        status: 0,
        data: null,
        message: "Invalid Password",
      });
    }
  } else {
    res.json({
      status: 0,
      data: null,
      message: "Invalid Email ID",
    });
  }
};

exports.authenticateAdminToken = (req, res, next) => {
  // console.log('In authentication')
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // console.log(token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.ADMIN_SECRET_KEY, (err, user) => {
    if (err) {
      // let refreshToken = null;
      // refreshToken = req.cookies.cuet_refresh_token; // Assuming refresh token in cookie
      // console.log(refreshToken);

      // if (refreshToken) {
      //   verifyAdminRefreshToken(refreshToken, (err, user) => {
      //     if (err) {
      //       return res.status(401).json({ message: "Invalid refresh token" });
      //     } else {
      //       // Generate new access and refresh tokens
      //       const newTokens = generateAdminTokens(user);
      //       res.cookie("cuet_access_token", newTokens.accessToken, {
      //         httpOnly: true,
      //         maxAge: 30 * 24 * 60 * 60 * 1000
      //       }); // Securely store access token
      //       res.cookie("cuet_refresh_token", newTokens.refreshToken, {
      //         httpOnly: true,
      //         maxAge: 30 * 24 * 60 * 60 * 1000
      //       }); // Securely store refresh token
      //       req.user = user;
      //       next();
      //     }
      //   });
      // } else {
      //   return res.status(401).json({ message: "Token expired" });
      // }
      res.status(401).json({
        status: 0,
        data: null,
        message: "Token expired!",
      });
    } else {
      req.user = user;
      // console.log('Authenticated');
      next();
    }
  });
};

function verifyAdminRefreshToken(refreshToken, callback) {
  // Replace with your implementation to verify refresh token
  // This could involve checking against a database or using a separate JWT secret key
  // Example:
  jwt.verify(
    refreshToken,
    process.env.ADMIN_REFRESH_KEY,
    (err, refreshUser) => {
      if (err) {
        callback(err);
      } else {
        callback(null, refreshUser); // Valid refresh token returns user data
      }
    }
  );
}

// Implement generateNewTokens function based on your configuration
function generateAdminTokens(user) {
  // Generate new access and refresh tokens with appropriate expiry times
  // Example:
  const accessToken = jwt.sign(
    { user: user.id },
    process.env.ADMIN_SECRET_KEY,
    { expiresIn: "10m" }
  );
  const refreshToken = jwt.sign(
    { user: user.id },
    process.env.ADMIN_REFRESH_KEY,
    { expiresIn: "10d" }
  );
  return { accessToken, refreshToken };
}

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.body.refreshToken;
    if (!token) {
      return res.status(404).json({
        status: 0,
        data: null,
        message: "Token not found!",
      });
    }

    jwt.verify(token, process.env.REFRESH_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(400).json({
          status: 0,
          data: null,
          message: "Token expired! Please log in again",
        });
      }
      const data = {};
      data["studentId"] = user.studentId;
      data["batchId"] = user.batchId;
      const accessToken = jwt.sign(data, process.env.TOKEN_SECRET_KEY, {
        expiresIn: "10m",
      });
      const refreshToken = jwt.sign(data, process.env.REFRESH_SECRET_KEY, {
        expiresIn: "10d",
      });

      res.json({
        status: 1,
        data: {
          accessToken,
          refreshToken,
        },
        message: "Request completed successfully",
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status:0,
      data:null,
      message:'Oops! Something went wrong!'
    })
  }
};

exports.refreshAdminToken = async (req, res, next) => {
  try {
    const token = req.body.refreshToken;
    if (!token) {
      return res.status(404).json({
        status: 0,
        data: null,
        message: "Token not found!",
      });
    }

    jwt.verify(token, process.env.ADMIN_REFRESH_KEY, (err, user) => {
      if (err) {
        return res.status(400).json({
          status: 0,
          data: null,
          message: "Token expired! Please log in again",
        });
      }
      const data = {};
      data["studentId"] = user.studentId;
      data["batchId"] = user.batchId;
      const accessToken = jwt.sign(data, process.env.ADMIN_SECRET_KEY, {
        expiresIn: "10m",
      });
      const refreshToken = jwt.sign(data, process.env.ADMIN_REFRESH_KEY, {
        expiresIn: "10d",
      });

      res.json({
        status: 1,
        data: {
          accessToken,
          refreshToken,
        },
        message: "Request completed successfully",
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status:0,
      data:null,
      message:'Oops! Something went wrong!'
    })
  }
};
