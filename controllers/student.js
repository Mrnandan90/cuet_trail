require("dotenv").config();

const Batch = require("../models/batch");
const Student = require("../models/student");
const Test = require("../models/test");
const TestItem = require("../models/testItem");
const Question = require("../models/question");
const Answer = require("../models/answer");
const Performance = require("../models/performance");
const OverallPerformance = require("../models/overallPerformance");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const moment = require("moment");

exports.createStudent = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const countryCode = req.body.countryCode;
    const phone = req.body.phone;
    const age = req.body.age;
    const cuetAttempts = req.body.cuetAttempts;
    const batchId = req.body.batchId;
    if (email !== process.env.ADMIN_EMAIL) {
      const result = await Student.findOne({
        where: {
          [Op.or]: [{ email: email }, { phone: phone }],
        },
      });
      if (result) {
        return res.status(400).json({
          status: 0,
          data: null,
          message: "User with same email or phone already exists!",
        });
      }

      if(password != confirmPassword){
        return res.status(400).json({
          status: 0,
          data:null,
          message: 'Passwords do not match!'
        })
      }

      const hashedPassword = await bcrypt.hash(
        password,
        +process.env.SALT_ROUNDS
      );

      // Generating password reset token
      const randomHexNumber = Math.floor(Math.random() * 16777215).toString(16);
      const hexCode = randomHexNumber.padStart(8, "0").toUpperCase();

      const hashedToken = await bcrypt.hash(hexCode, +process.env.SALT_ROUNDS);

      const data = {
        phone: countryCode+phone,
        name: name,
        email: email,
        password: hashedPassword,
        resetToken: hashedToken,
        age: age,
        cuetAttempts: cuetAttempts.join(" "),
        batchId: batchId,
      };
      const student = await Student.create(data);
      if (student) {
        return res.json({
          status: 0,
          data: {
            studentId: student.id,
            resetToken: hexCode,
          },
          message: "User created successfully!",
        });
      }
    } else {
      res.status(400).json({
        status: 0,
        data: null,
        message: "Email cannot be used! Please try with different email id!",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 0,
      data: null,
      message: "Oops! Something went wrong!",
    });
  }
};

exports.passwordReset = async (req, res, next) => {
  try {
    const email = req.body.email;
    const countryCode = req.body.countryCode;
    const phone = req.body.phone;
    const resetToken = req.body.resetToken;
    const password = req.body.newPassword;
    const confirmPassword = req.body.confirmNewPassword;

    const student = await Student.findOne({ where: { email: email } });
    if (!student) {
      return res.status(404).json({
        status: 0,
        data: null,
        message: "User with email not found!",
      });
    }

    if (student.phone != countryCode + phone) {
      return res.status(400).json({
        status: 0,
        data: null,
        message: "Email and phone doesn't match!",
      });
    }

    if (password != confirmPassword) {
      return res.status(400).json({
        status: 0,
        data: null,
        message: "Passwords do not match!",
      });
    }

    const verifyToken = await bcrypt.compare(resetToken, student.resetToken);

    if (!verifyToken) {
      return res.status(400).json({
        status: 0,
        data: null,
        message: "Reset token doesn't match!",
      });
    }

    // console.log(password, process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(
      password,
      +process.env.SALT_ROUNDS
    );

    // Generating new password reset token
    const randomHexNumber = Math.floor(Math.random() * 16777215).toString(16);
    const hexCode = randomHexNumber.padStart(8, "0").toUpperCase();

    const newHashedToken = await bcrypt.hash(hexCode, +process.env.SALT_ROUNDS);

    student.password = hashedPassword;
    student.resetToken = newHashedToken;

    const newStudent = await student.save();
    if (!newStudent) {
      return res.status(500).json({
        status: 0,
        data: null,
        message: "Oops! Something went wrong!",
      });
    }

    res.json({
      status: 1,
      data: {
        studentId: newStudent.id,
        resetToken: hexCode,
      },
      message: "Request completed successfully!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 0,
      data: null,
      message: "Oops! Something went wrong!",
    });
  }
};

exports.getLastTestPerformance = (req, res, next) => {
  try {
    Performance.findAll({
      where: { studentId: req.user.studentId },
      order: [["createdAt", "DESC"]],
      limit: 1,
    })
      .then((performances) => {
        if (performances.length > 0) {
          const performance = performances[0] ? performances[0] : null;
          if (performance) {
            performance.dataValues.totalScoreObtained =
              performance?.dataValues.score;
            performance.dataValues.totalScore = performance?.dataValues.total;
            delete performance.dataValues.score;
            delete performance.dataValues.total;
            delete performance.dataValues.createdAt;
            delete performance.dataValues.updatedAt;
            performance.dataValues.totalQuestions =
              performance.dataValues.correct +
              performance.dataValues.unattempted +
              performance.dataValues.incorrect;
          }
          res.json({
            status: 1,
            data: performance,
            message: "Request completed successfully",
          });
        } else {
          res.status(404).json({
            status: 0,
            data: null,
            message: "Student does not have previous performances",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          status: 0,
          data: null,
          message: "Oops! Something went wrong!",
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 0,
      data: null,
      message: "Oops! Something went wrong!",
    });
  }
};

exports.getOverallPerformance = (req, res, next) => {
  try {
    OverallPerformance.findOne({
      where: { studentId: req.user.studentId },
      // order: [['createdAt', 'DESC']],
      // limit: 1
    })
      .then((performance) => {
        if (performance) {
          // console.log(performance);
          performance.dataValues.totalScoreObtained =
            performance.dataValues.scoreObtained;
          delete performance.dataValues.scoreObtained;
          delete performance.dataValues.createdAt;
          delete performance.dataValues.updatedAt;
          performance.dataValues.totalQuestions =
            performance.dataValues.correct +
            performance.dataValues.unattempted +
            performance.dataValues.incorrect;
          res.json({
            status: 1,
            data: performance,
            message: "Request completed Successfully",
          });
        } else {
          res.status(404).json({
            status: 0,
            data: null,
            message: "Data not found!",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          status: 0,
          data: null,
          message: "Oops! Something went wrong!",
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 0,
      data: null,
      message: "Oops! Something went wrong!",
    });
  }
};

exports.getNextTest = async (req, res, next) => {
  const batchId = req.user.batchId;
  const now = new Date();
  try { 
    const tests = await Test.findAll({
      where: {
        batchId: batchId,
        endTime: {
          [Sequelize.Op.gt]: now,
        },
      },
      order: [["endTime", "ASC"]],
      limit: 1,
    });
    if (tests.length > 0) {
      let startTime = moment.utc(tests[0]?.startTime).utcOffset(330);
      let endTime = moment.utc(tests[0]?.endTime).utcOffset(330);
      res.json({
        status: 1,
        data: {
          testId: tests[0].id,
          timeAllotted: tests[0].timeAllotted,
          startTime: startTime.format("YYYY-MM-DDTHH:mm:ss.SSS"),
          endTime: endTime.format("YYYY-MM-DDTHH:mm:ss.SSS"),
        },
        message: "Request completed successfully",
      });
    } else {
      res.json({
        status: 1,
        data: null,
        message: "Next test has not been scheduled yet!",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 0,
      data: null,
      message: "Oops! Something went wrong!",
    });
  }
};

exports.getRemark = (req, res, next) => {
  OverallPerformance.findOne({
    where: { studentId: 55 },
  })
    .then((student) => {
      let remark = null;
      const accuracy = student.accuracy;
      if (accuracy >= 95) {
        remark = "EXCELLENT";
      } else if (accuracy >= 90 && accuracy < 95) {
        remark = "VERY GOOD";
      } else if (accuracy >= 80 && accuracy < 90) {
        remark = "GOOD!";
      } else if (accuracy >= 70 && accuracy < 80) {
        remark = "NEED IMPROVEMENT";
      } else {
        remark = "HEAVY IMPROVEMENT REQUIRED";
      }
      return res.json({
        status: 1,
        data: { remark: remark },
        message: "Request completed successfully!",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        status: 0,
        data: null,
        message: "Oops! Something went wrong!",
      });
    });
};

exports.startTest = (req, res, next) => {
  const studentId = req.user.studentId;
  const testId = req.body.testId;
  const batchId = req.user.batchId;
  // console.log(studentId);
  // console.log(testId);
  // console.log(batchId);
  if (testId && studentId && batchId) {
    try {
      Test.findOne({ where: { id: testId } }).then((test) => {
        if (test && batchId == test.dataValues.batchId) {
          TestItem.findOne({ where: { studentId: studentId, testId: testId } })
            .then((testItem) => {
              // console.log(testItem.dataValues);
              if (testItem) {
                let testEndTime = new Date(testItem.dataValues.startTime);
                testEndTime.setTime(
                  testEndTime.getTime() +
                    test.dataValues.timeAllotted * 60 * 1000
                );
                testEndTime = testEndTime.toISOString();

                // let currentTime = new Date();
                // currentTime = new Date(currentTime).toISOString();

                // console.log(testEndTime);
                // console.log(currentTime);

                if (testItem.endTime) {
                  res.status(400).json({
                    status: 0,
                    data: null,
                    message: "Test is already submitted",
                  });
                } else if (testEndTime < new Date().toISOString()) {
                  testItem.endTime = testEndTime;
                  testItem
                    .save()
                    .then(() => {
                      res.status(400).json({
                        status: 0,
                        data: null,
                        message: "Test submition time expired",
                      });
                    })
                    .catch((err) => {
                      console.log(err);
                      res.status(500).json({
                        status: 0,
                        data: null,
                        message: "Oops! Something went wrong!",
                      });
                    });
                } else {
                  delete testItem.dataValues.endTime;
                  delete testItem.dataValues.id;
                  delete testItem.dataValues.createdAt;
                  delete testItem.dataValues.updatedAt;
                  const startTime = new Date(testItem.dataValues.startTime);
                  startTime.setTime(startTime.getTime() + 5.5 * 60 * 60 * 1000);
                  testItem.dataValues.startTime = startTime;
                  res.json({
                    status: 1,
                    data: testItem,
                    message: "Request completed successfully",
                  });
                }
              } else {
                const testEndTime = new Date(test.endTime);
                // testEndTime.setTime(testEndTime.getTime() + 5.5 *60 * 60 *1000);
                // if()
                if (testEndTime < new Date()) {
                  return res.status(400).json({
                    status: 0,
                    data: null,
                    message: "Test has expired",
                  });
                }
                // if()
                const data = {
                  startTime: new Date(),
                  testId: testId,
                  studentId: studentId,
                };
                TestItem.create(data)
                  .then((result) => {
                    console.log(result.dataValues);
                    res.json({
                      status: 1,
                      data: {
                        info: "Test started",
                      },
                      message: "Request completed successfully",
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                      status: 0,
                      data: null,
                      message: "Oops! Something went wrong!",
                    });
                  });
              }
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                status: 0,
                data: null,
                message: "Oops! Something went wrong!",
              });
            });
          // res.json({status: 1, data:{date: new Date().toLocaleString({ timeZone: 'Asia/Kolkata' })}, message:"Request completed Successfully"})
        } else {
          res
            .status(400)
            .json({ status: 0, data: null, message: "Wrong Test!" });
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: 0,
        data: null,
        message: "Oops! Something went wrong!",
      });
    }
  } else {
    res.status(400).json({
      status: 0,
      data: null,
      message: "Invalid Request",
    });
  }

  // Student.findOne({where: {id: studentId}}).then(student => {
  //     const batchId = student.batchId;
  //
  // })
};

exports.getQuestions = (req, res, next) => {
  const testId = req.query.testId;
  Question.findAll({ where: { testId: testId } })
    .then(async (result) => {
      if (result.length > 0) {
        result.forEach((question) => {
          const options = [];
          options.push(question.dataValues.correctOption);
          options.push(question.dataValues.option2);
          options.push(question.dataValues.option3);
          options.push(question.dataValues.option4);
          question.dataValues.option5 != null
            ? options.push(question.dataValues.option5)
            : null;

          // Sending options in randomize pattern
          question.dataValues.options = options.sort(() => Math.random() - 0.5);

          // Deleting unwanted info for response
          delete question.dataValues.correctOption;
          delete question.dataValues.option2;
          delete question.dataValues.option3;
          delete question.dataValues.option4;
          delete question.dataValues.option5;
          // delete question.dataValues.id;
          delete question.dataValues.createdAt;
          delete question.dataValues.updatedAt;
          delete question.dataValues.testId;
        });

        // Randomize Questions
        result = result.sort(() => Math.random() - 0.5);

        for (i = 0; i < result.length; i++) {
          const question = result[i];
          const answer = await Answer.findOne({
            where: { studentId: req.user.studentId, questionId: question.id },
          });
          if (answer) {
            result[i].dataValues.submittedAnswer = answer.value;
          }
        }

        res.json({
          status: 1,
          data: result,
          message: "Request completed successfully",
        });
      } else {
        res.status(404).json({
          status: 0,
          data: null,
          message: "Questions not found for the given test id!",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        status: 0,
        data: null,
        message: "Oops! Something went wrong!",
      });
    });
};

exports.getTestPerformance = async (req, res, next) => {
  const testId = req.params.testId;
  const studentId = req.user.studentId;

  try {
    const result = await Test.findOne({ where: { id: testId } });
    if (!result) {
      return res.status(404).json({
        status: 0,
        data: null,
        message: "Test not found",
      });
    }

    delete result.dataValues.createdAt;
    delete result.dataValues.updatedAt;

    const testItem = await TestItem.findOne({
      where: { testId: testId, studentId: studentId },
    });

    if (!testItem) {
      return res.status(404).json({
        status: 0,
        data: null,
        message: "Test details not found",
      });
    }

    if (!testItem.endTime) {
      let testEndTime = new Date(testItem.dataValues.startTime);
      testEndTime.setTime(
        testEndTime.getTime() + result.dataValues.timeAllotted * 60 * 1000
      );
      testEndTime = new Date(testEndTime);
      testItem.endTime = testEndTime;
      await testItem.save();
    }

    const startTime = new Date(testItem.startTime);
    const endTime = new Date(testItem.endTime);
    startTime.setTime(startTime.getTime() + 5.5 * 60 * 60 * 1000);
    endTime.setTime(endTime.getTime() + 5.5 * 60 * 60 * 1000);
    result.dataValues.startTime = startTime;
    result.dataValues.endTime = endTime;

    const performance = await Performance.findOne({
      where: { testId: testId, studentId: studentId },
    });

    if (!performance) {
      return res.status(404).json({
        status: 0,
        data: null,
        message: "Test performance data not found",
      });
    }

    performance.dataValues.totalScoreObtained = performance.dataValues.score;
    performance.dataValues.totalScore = performance.dataValues.total;
    performance.dataValues.accuracy = Math.round(
      (performance.dataValues.totalScoreObtained /
        performance.dataValues.totalScore) *
        100
    );
    delete performance.dataValues.createdAt;
    delete performance.dataValues.updatedAt;
    delete performance.dataValues.score;
    delete performance.dataValues.total;

    res.json({
      status: 1,
      data: {
        testInfo: result,
        testPerformance: performance,
      },
      message: "Request completed successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 0,
      data: null,
      message: "Oops! Something went wrong!!!",
    });
  }
};

exports.getTestList = async (req, res, next) => {
  const studentId = req.user.studentId;
  try {
    const result = await Performance.findAll({
      where: { studentId: studentId },
    });
    if (result.length > 0) {
      for (let i = 0; i < result.length; i++) {
        const performance = result[i];
        result[i].dataValues.accuracy = Math.round(
          (performance.dataValues.score / performance.dataValues.total) * 100
        );
        result[i].dataValues.totalScoreObtained = performance.dataValues.score;
        result[i].dataValues.totalScore = performance.dataValues.total;
        // performance.dataValues.date = performance.dataValues.createdAt;
        const testDetails = await Test.findOne({
          where: { id: performance.testId },
        });
        result[i].dataValues.date = testDetails.startTime;
        result[i].dataValues.subject = testDetails.subject;
        delete result[i].dataValues.createdAt;
        delete result[i].dataValues.updatedAt;
        delete result[i].dataValues.id;
        delete result[i].dataValues.studentId;
        delete result[i].dataValues.score;
        delete result[i].dataValues.total;
      }
      res.json({
        status: 1,
        data: result,
        message: "Request completed successfully",
      });
    } else {
      res.json({
        status: 1,
        data: [],
        message: "Request completed successfully",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 0,
      data: null,
      message: "Oops! Something went wrong!",
    });
  }
};

exports.submitTest = async (req, res, next) => {
  const studentId = req.user.studentId;
  const testId = req.params.testId;

  try {
    const testItem = await TestItem.findOne({
      where: { studentId: studentId, testId: testId },
    });

    if (!testItem) {
      return res.status(400).json({
        status: 0,
        data: null,
        message: "Test does not exist",
      });
    }

    if (testItem.endTime) {
      return res.status(400).json({
        status: 0,
        data: null,
        message: "Test is already submitted",
      });
    }

    const test = await Test.findOne({ where: { id: testId } });
    const lastValidTime = new Date(testItem.startTime);
    let endTime;

    lastValidTime.setTime(
      lastValidTime.getTime() + test.timeAllotted * 60 * 1000
    );

    if (lastValidTime.toISOString() < new Date().toISOString()) {
      endTime = lastValidTime;
    } else {
      endTime = new Date();
    }

    testItem.endTime = endTime;

    const result = await testItem.save();
    if (!result) {
      return res.status(500).json({
        status: 0,
        data: null,
        message: "Oops! Something went wrong!",
      });
    }
    const resData = {};
    const startTime = new Date(result.startTime);
    startTime.setTime(startTime.getTime() + 5.5 * 60 * 60 * 1000);
    endTime.setTime(endTime.getTime() + 5.5 * 60 * 60 * 1000);
    resData["testId"] = result.testId;
    resData["startTime"] = startTime;
    resData["endTime"] = endTime;
    res.json({
      status: 1,
      data: resData,
      message: "Test submitted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Oops! Something went wrong!",
    });
  }
};

exports.submitAnswer = async (req, res, next) => {
  try {
    const studentId = req.user.studentId;
    const batchId = req.user.batchId;
    const questionId = req.params.questionId;
    const testId = req.body.testId;
    const value = req.body.value;

    const test = await Test.findOne({ where: { id: testId, batchId } });
    if (!test) {
      return res.status(404).json({
        status: 0,
        data: null,
        redirect: true,
        message: "Test not found",
      });
    }
    // console.log(test);
    const testItem = await TestItem.findOne({ where: { testId, studentId } });
    if (!testItem) {
      return res.status(400).json({
        status: 0,
        data: null,
        redirect: true,
        message: "Test not yet started!",
      });
    }
    const lastValidTime = new Date(testItem.startTime);
    lastValidTime.setTime(
      lastValidTime.getTime() + test.timeAllotted * 60 * 1000
    );
    if (testItem.endTime) {
      // console.log(lastValidTime)
      return res.status(400).json({
        status: 0,
        data: null,
        redirect: true,
        message: "Test has been already submitted!",
      });
    }
    if (lastValidTime.toISOString() < new Date().toISOString()) {
      return res.status(400).json({
        status: 0,
        data: null,
        redirect: true,
        message: "Answer submittion time expired!",
      });
    }
    const question = await Question.findOne({
      where: { testId, id: questionId },
    });
    if (!question) {
      return res.status(404).json({
        status: 0,
        data: null,
        redirect: true,
        message: "Question not found",
      });
    }

    if (
      !(
        question.correctOption == value ||
        question.option2 == value ||
        question.option3 == value ||
        question.option4 == value ||
        question.option5 == value
      )
    ) {
      console.log("Wrong");
      return res.status(400).json({
        status: 0,
        data: null,
        message: "Invalid option for the required question",
      });
    }
    // if()
    const data = {};
    data["value"] = req.body.value;
    data["questionId"] = question.id;
    data["studentId"] = req.user.studentId;
    const answer = await Answer.findOne({ where: { questionId, studentId } });
    if (!answer) {
      const newAnswer = await Answer.create(data);
      const resData = {};
      resData["value"] = newAnswer.value;
      resData["questionId"] = +questionId;
      resData["testId"] = test.id;
      resData["studentId"] = studentId;
      if (!newAnswer) {
        return res.status(500).json({
          status: 0,
          data: null,
          message: "Oops! Something went wrong!",
        });
      } else {
        res.json({
          status: 1,
          data: resData,
          message: "Request completed successfully!",
        });
      }
    } else {
      answer.value = data.value;
      await answer.save();
      const resData = {};
      resData["value"] = answer.value;
      resData["questionId"] = +questionId;
      resData["testId"] = test.id;
      resData["studentId"] = studentId;
      res.json({
        status: 1,
        data: resData,
        message: "Request completed successfully!",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 0,
      data: null,
      message: "Oops! Something went wrong!",
    });
  }
};
