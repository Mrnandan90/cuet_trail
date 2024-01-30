const Batch = require('../models/batch');
const Student = require('../models/student');
const Test = require('../models/test');
const TestItem = require('../models/testItem');
const Question = require('../models/question');
const Answer = require('../models/answer');
const Performance = require('../models/performance');
const OverallPerformance = require('../models/overallPerformance');
const {Sequelize} = require("sequelize");
const {Op} = require("sequelize");

const userId = 56;

exports.getLastTestPerformance = (req, res, next) => {
  try {
    Performance.findAll({
      where: {studentId: 56},
      order: [['createdAt', 'DESC']],
      limit: 1
    }).then((performances) => {
      const performance = performances[0] ? performances[0] : null;
      performance.dataValues.totalScore = performance.dataValues.score;
      delete performance.dataValues.score;
      performance.dataValues.totalQuestions = performance.dataValues.correct + performance.dataValues.unattempted + performance.dataValues.incorrect;
      res.json({status: 1, data: performance});
    }).catch(err => console.log(err));
  } catch (err) {
    console.log(err)
  }
}

exports.getOverallPerformance = (req, res, next) => {
  try {
    OverallPerformance.findOne({
      where: {studentId: 56},
      // order: [['createdAt', 'DESC']],
      // limit: 1
    }).then((performance) => {
      performance.dataValues.totalScore = performance.dataValues.total;
      delete performance.dataValues.total;
      performance.dataValues.totalQuestions = performance.dataValues.correct + performance.dataValues.unattempted + performance.dataValues.incorrect;
      res.json({status: 1, data: performance});
    }).catch(err => console.log(err));
  } catch (err) {
    console.log(err)
  }
}

exports.getNextTest = (req, res, next) => {
  const batchId = 1;
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000; // Offset for IST in milliseconds
  const nowInIST = new Date(now.getTime() + offset);
  Test.findAll({
    where: {
      batchId: batchId,
      endTime: {
        [Sequelize.Op.gt]: nowInIST
      }
    },
    order: [['endTime', 'ASC']],
    limit: 1
  }).then((tests) => {
    // console.log(tests);
    if (tests.length > 0) {
      const latestTest =
        res.json({
          status: 1,
          data: {
            startTime: tests[0].startTime,
            endTime: tests[0].endTime
          },
          message: "Request completed successfully"
        });
    } else {
      res.json({
        status: 1,
        data: null,
        message: "Next test has not been scheduled yet!"
      })
    }
  }).catch(err => console.log(err));
}

exports.getRemark = (req, res, next) => {
  OverallPerformance.findOne({
    where: {studentId: 55},
  }).then((student) => {
    let remark = null;
    const accuracy = student.accuracy;
    if (accuracy >= 95) {
      remark = "EXCELLENT"
    } else if (accuracy >= 90 && accuracy < 95) {
      remark = "VERY GOOD"
    } else if (accuracy >= 80 && accuracy < 90) {
      remark = "GOOD!"
    } else if (accuracy >= 70 && accuracy < 80) {
      remark = "NEED IMPROVEMENT"
    } else {
      remark = "HEAVY IMPROVEMENT REQUIRED";
    }
    return res.json({status: 1, data: {remark: remark}, message: "Request completed successfully!"})
  }).catch((err) => {
    console.log(err)
  })
}

exports.startTest = (req, res, next) => {
  const studentId = req.body.studentId;
  const testId = req.body.testId;
  const batchId = req.body.batchId;
  Test.findOne({where: {id: testId}}).then(test => {
    if (test && batchId == test.dataValues.batchId) {
      TestItem.findOne({where: {studentId: studentId, testId: testId}}).then(testItem => {
        // console.log(testItem.dataValues);
        if (testItem) {
          
          let testEndTime = new Date(testItem.dataValues.startTime);
          testEndTime.setTime(testEndTime.getTime()+ test.dataValues.timeAllotted * 60 * 1000);
          testEndTime = new Date(testEndTime).toISOString();
          
          let currentTime = new Date();
          currentTime.setTime(currentTime.getTime()+ 5.5 * 60 * 60 * 1000);
          currentTime = new Date(currentTime).toISOString();
          
          // console.log(testEndTime);
          // console.log(currentTime);
          
          if (testItem.dataValues.endTime != null) {
            res.json({
              status: 0,
              message: "Test is already submitted"
            });
          } else if( testEndTime < currentTime ){
            testItem.endTime = testEndTime;
            testItem.save().then(()=>{
              res.json({
                status:0,
                data: null,
                message: "Test submition time expired"
              });
            }).catch(err=> console.log(err));
          } else {
            delete testItem.dataValues.endTime;
            delete testItem.dataValues.createdAt;
            delete testItem.dataValues.updatedAt;
            res.json({
              status: 1,
              data: testItem,
              message: "Request completed successfully"
            });
          }
        } else {
          const data = {
            startTime: new Date(),
            testId: testId,
            studentId: studentId
          };
          TestItem.create(data).then((result) => {
            console.log(result.dataValues);
            res.json({
              status: 1,
              message: "Request completed successfully"
            });
          }).catch(err => console.log(err));
        }
      }).catch(err => console.log(err));
      // res.json({status: 1, data:{date: new Date().toLocaleString({ timeZone: 'Asia/Kolkata' })}, message:"Request completed Successfully"})
    } else {
      res.json({status: 0, data: null, message: "Wrong Test!"})
    }
  })
  // Student.findOne({where: {id: studentId}}).then(student => {
  //     const batchId = student.batchId;
  //
  // })
}

exports.getQuestions = (req, res, next) => {
  const testId = req.body.testId;
  Question.findAll({where: {testId: testId}}).then(result => {
    if (result.length > 0) {
      result.forEach(question => {
        
        const options = [];
        options.push(question.dataValues.correctOption);
        options.push(question.dataValues.option2);
        options.push(question.dataValues.option3);
        options.push(question.dataValues.option4);
        question.dataValues.option5 != null ? options.push(question.dataValues.option5) : null;
        
        // Sending options in randomize pattern
        question.dataValues.options = options.sort(() => Math.random() - 0.5);
        
        // Deleting unwanted info for response
        delete question.dataValues.correctOption;
        delete question.dataValues.option2;
        delete question.dataValues.option3;
        delete question.dataValues.option4;
        delete question.dataValues.option5;
        delete question.dataValues.id;
        delete question.dataValues.createdAt;
        delete question.dataValues.updatedAt;
        delete question.dataValues.testId;
      });
      
      // Randomize Questions
      result = result.sort(() => Math.random() - 0.5);
      
      res.json({status: 1, message: "Request completed successfully", data: result});
    } else {
      res.json({status: 0, message: "Questions not found for the given test id!", data: null})
    }
  }).catch(err => console.log(err));
  
}

exports.getTestPerformance = (req, res, next) => {
  const testId = req.body.testId;
  const studentId = 1;
  let testDetails;
  Test.findOne({where: {id: testId}}).then(result => {
    testDetails = result.dataValues;
    delete testDetails.createdAt;
    delete testDetails.updatedAt;
    TestItem.findOne({where: {testId: testId, studentId: studentId}}).then(testItem => {
      testDetails.startTime = testItem.dataValues.startTime;
      if(testItem.dataValues.endTime){
        testDetails.endTime = testItem.dataValues.endTime;
      } else {
        let testEndTime = new Date(testItem.dataValues.startTime);
        testEndTime.setTime(testEndTime.getTime()+ result.dataValues.timeAllotted * 60 * 1000);
        testEndTime = new Date(testEndTime).toISOString();
        testDetails.endTime = testEndTime;
        testItem.endTime = testEndTime;
        testItem.save();
      }
      Performance.findOne({where: {testId: testId, studentId: studentId}}).then(performance => {
        if(performance){
          performance.dataValues.totalScoreObtained = performance.dataValues.score;
          performance.dataValues.totalScore = performance.dataValues.total;
          performance.dataValues.accuracy = Math.round(performance.dataValues.totalScoreObtained / performance.dataValues.totalScore * 100);
          delete performance.dataValues.createdAt;
          delete performance.dataValues.updatedAt;
          delete performance.dataValues.score;
          delete performance.dataValues.total;
          res.json({
            status: 1,
            data: {
              testInfo: testDetails,
              testPerformance: performance
            },
            message: "Request completed successfully"
          })
        } else {
          res.json({
            status: 0,
            data: null,
            message: "Test performance data not found"
          })
        }
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));
  }).catch(err => console.log(err));
  
}

exports.getTestList = (req, res, next) => {
  const studentId = 1;
  Performance.findAll({where: {studentId: studentId}}).then(result => {
    if (result.length > 0) {
      result.forEach(performance => {
        performance.dataValues.accuracy = Math.round(performance.dataValues.score / performance.dataValues.total * 100);
        performance.dataValues.totalScoreObtained = performance.dataValues.score;
        performance.dataValues.totalScore = performance.dataValues.total;
        delete performance.dataValues.createdAt;
        delete performance.dataValues.updatedAt;
        delete performance.dataValues.id;
        delete performance.dataValues.studentId;
        delete performance.dataValues.score;
        delete performance.dataValues.total;
      })
      res.json({
        status: 1,
        data: result,
        message: "Request completed successfully"
      })
    } else {
      res.json({
        status: 1,
        data: [],
        message: "Request completed successfully"
      })
    }
  }).catch(err => console.log(err));
}

exports.submitTest = (req, res, next) => {
  const studentId = req.body.studentId;
  const testId = req.body.testId;
  const testItemId = req.body.testItemId;
  TestItem.findOne({where: {id: testItemId, studentId: studentId, testId: testId}}).then(result => {
    if (!result) {
      res.json({status: 0, message: "Test does not exist"});
    } else {
      if (result.endTime) {
        return res.json({status: 0, message: "Test is already submitted"});
      }
      const endTime = new Date();
      result.endTime = endTime;
      result.save().then(testItem => {
        res.json({status: 1, message: "Test submitted successfully"});
      }).catch(err => console.log(err));
    }
  })
}
