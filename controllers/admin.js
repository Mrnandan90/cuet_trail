// const express = require('express');

const Batch = require("../models/batch");
const Student = require("../models/student");
const Test = require("../models/test");
const Question = require("../models/question");
const Answer = require("../models/answer");
const Performance = require("../models/performance");
const OverallPerformance = require("../models/overallPerformance");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");

exports.get10BestPerformingStudent = async (req, res, next) => {
  try {
    const topStudents = await Student.findAll({
      include: [
        {
          model: OverallPerformance,
          required: true, // Ensure that there is a matching entry in the OverallPerformance table
        },
      ],
      order: [[OverallPerformance, "accuracy", "DESC"]], // Order by score in descending order
      limit: 10, // Limit the result to the top 10 students
    });
    // console.log('Top 10 Students:', topStudents);
    topStudents.forEach((student) => {
      delete student.dataValues.phone;
      delete student.dataValues.email;
      delete student.dataValues.password;
      delete student.dataValues.age;
      delete student.dataValues.cuetAttempts;
      delete student.dataValues.createdAt;
      delete student.dataValues.updatedAt;
      student.dataValues.accuracy =
        student.dataValues.overallPerformance.accuracy;
      delete student.dataValues.overallPerformance;
    });
    // res.send(topStudents);
    res.json({
      status: 1,
      data: topStudents,
      message: "Request completed successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.json({
      status: 0,
      data: error,
      message: "Something went wrong!",
    });
  }
};

exports.get10WorstPerformingStudent = async (req, res, next) => {
  try {
    const bottomStudents = await Student.findAll({
      include: [
        {
          model: OverallPerformance,
          required: true, // Ensure that there is a matching entry in the OverallPerformance table
        },
      ],
      order: [[OverallPerformance, "accuracy", "ASC"]], // Order by score in ascending order
      limit: 10,
    });
    // console.log('Top 10 Students:', topStudents);
    bottomStudents.forEach((student) => {
      delete student.dataValues.phone;
      delete student.dataValues.email;
      delete student.dataValues.password;
      delete student.dataValues.age;
      delete student.dataValues.cuetAttempts;
      delete student.dataValues.createdAt;
      delete student.dataValues.updatedAt;
      student.dataValues.accuracy =
        student.dataValues.overallPerformance.accuracy;
      delete student.dataValues.overallPerformance;
    });
    // res.send(bottomStudents);
    res.json({
      status: 1,
      data: bottomStudents,
      message: "Request completed successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.json({
      status: 0,
      data: error,
      message: "Something went wrong!",
    });
  }
};

exports.getLastTestDate = async (req, res, next) => {
  try {
    const lastTest = await Test.findOne({
      order: [["createdAt", "DESC"]], // Assuming 'createdAt' is your timestamp or primary key column
    });

    res.json({
      status: 1,
      data: { date: lastTest.startTime },
      message: "Request completed successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.json({
      status: 0,
      data: error,
      message: "Something went wrong!",
    });
  }
};

exports.getStudentList = async (req, res, next) => {
  try {
    const students = await Student.findAll({
      include: [
        {
          model: OverallPerformance,
          required: true, // Ensure that there is a matching entry in the OverallPerformance table
        },
      ],
    });
    students.forEach((student, index) => {
      const string = student.dataValues["cuetAttempts"];
      const attempts = string.split(" ");
      student.dataValues["cuetAttempts"] = attempts;
      delete student.dataValues["password"];
      delete student.dataValues["createdAt"];
      delete student.dataValues["updatedAt"];
      delete student.dataValues["overallPerformance"].dataValues["createdAt"];
      delete student.dataValues["overallPerformance"].dataValues["updatedAt"];
      delete student.dataValues["overallPerformance"].dataValues["studentId"];
    });
    // res.json(students);
    res.json({
      status: 1,
      data: students,
      message: "Request completed successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.json({
      status: 0,
      data: error,
      message: "Something went wrong!",
    });
  }
};

exports.getBatchList = async (req, res, next) => {
  try {
    const batches = await Batch.findAll();
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const students = await Student.findAll({
        where: { batchId: batch.id },
        include: [
          {
            model: OverallPerformance,
            required: true, // Ensure that there is a matching entry in the OverallPerformance table
          },
        ],
      });
      // console.log(students);
      const count = students.length;
      batches[i].dataValues["studentCount"] = count;
      let sumAccuracy = 0;
      for (let j = 0; j < count; j++) {
        sumAccuracy +=
          students[j].dataValues["overallPerformance"].dataValues["accuracy"];
      }
      batches[i].dataValues["averageAccuracy"] =
        Math.round((sumAccuracy / count) * 100) / 100;
      delete batches[i].dataValues["createdAt"];
      delete batches[i].dataValues["updatedAt"];
      // console.log(batch);
    }
    res.json({
      status: 1,
      data: batches,
      message: "Request completed successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: 0,
      data: error,
      message: "Something went wrong!",
    });
  }
};

exports.getStudentCount = async (req, res, next) => {
  try {
    const count = await Student.count({});
    // console.log(count);
    res.status(200);
    const response = {};
    response["status"] = 1;
    response["total"] = count;
    res.send(response);
  } catch (err) {
    console.log(err);
  }
};

exports.getTestCount = async (req, res, next) => {
  try {
    const count = await Test.count({});
    // console.log(count);
    res.status(200);
    const response = {};
    response["status"] = 1;
    response["total"] = count;
    res.send(response);
  } catch (err) {
    console.log(err);
  }
};

exports.getBatchCount = async (req, res, next) => {
  try {
    const count = await Batch.count({});
    // console.log(count);
    res.status(200);
    const response = {};
    response["status"] = 1;
    response["total"] = count;
    res.send(response);
  } catch (err) {
    console.log(err);
  }
};

exports.getOverallPerformanceRatio = async (req, res, next) => {
  try {
    const good = await OverallPerformance.count({
      where: {
        accuracy: {
          [Op.gte]: 75,
        },
      },
    });
    const bad = await OverallPerformance.count({
      where: {
        accuracy: {
          [Op.lt]: 75,
        },
      },
    });
    const total = +good + +bad;
    res.status(200);
    const response = {};
    response["status"] = 1;
    response["goodPerforming"] = good;
    response["badPerforming"] = bad;
    response["total"] = total;
    res.send(response);
  } catch (err) {
    console.log(err);
  }
};

exports.createBatch = async (req, res, next) => {
  try {
    const body = req.body;
    const data = {};
    req.body.id ? (data["id"] = req.body.id) : null;
    data["name"] = body.name;
    data["startDate"] = body.startDate;
    Batch.create(data).then((result) => {
      res.send({ status: 1, message: "Batch Created Successfully" });
    });
  } catch (err) {
    console.log(err);
  }
};

exports.scheduleTest = async (req, res, next) => {
  try {
    const body = req.body;
    const data = {};

    // Setting date according to IST
    let startTime = new Date(body.date);
    let endTime = new Date(body.date);
    endTime.setTime(endTime.getTime() + 24 * 60 * 60 * 1000);
    endTime = endTime.toISOString();
    // console.log(endTime);
    // const timeDifferenceInMilliseconds = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
    // date.setTime(date.getTime() - timeDifferenceInMilliseconds);

    // Payload
    data["startTime"] = startTime;
    data["endTime"] = endTime;
    data["timeAllotted"] = body.timeAllotted;
    data["totalQuestions"] = body.totalQuestions;
    data["subject"] = body.subject;
    data["batchId"] = body.batchId;

    Test.create(data)
      .then((result) => {
        // console.log(result.dataValues);
        res.json({
          status: 1,
          message: "Test Created Successfully!",
          test_id: result.dataValues.id,
          total_questions: +result.dataValues.totalQuestions,
        });
      })
      .catch((err) => console.log(err));
  } catch (err) {
    console.log(err);
  }
};

exports.addQuestions = async (req, res, next) => {
  try {
    const test_id = req.body.test_id;
    const questions = req.body.questions;
    let isCorrectFormat = true;
    questions.forEach((question) => {
      const regex = /^[^;]+$/;
      question.testId = test_id;
      const q = regex.test(question.question);
      const correct = regex.test(question.correctOption);
      const o2 = regex.test(question.option2);
      const o3 = regex.test(question.option3);
      const o4 = regex.test(question.option4);
      const o5 = regex.test(question.option5);
      if (!(q && correct && o2 && o3 && o4 && o5)) {
        isCorrectFormat = false;
      }
    });

    if (!isCorrectFormat) {
      return res.send({
        status: 0,
        message: "Please provide questions in valid format",
      });
    } else {
      Question.bulkCreate(questions)
        .then((result) => {
          res.send({
            status: 1,
            message: "Questions Added Successfully!",
            test_id: test_id,
            total_questions_added: questions.length,
          });
        })
        .catch((err) =>
          res.send({ status: 0, message: "Please check question format!" })
        );
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getAllBatchPerformance = async (req, res, next) => {
  const batches = await Batch.findAll({
    include: [
      {
        model: Student,
        include: [
          {
            model: OverallPerformance,
          },
        ],
      },
    ],
  });

  const batchPerformances = [];
  for (const batch of batches) {
    const totalMarks = batch.students.reduce((sum, student) => {
      console.log(student);
      if (student.overallPerformance) {
        console.log(student.overallPerformance.accuracy);
        return sum + student.overallPerformance.accuracy;
      } else {
        return sum;
      }
    }, 0);

    const averageMarks = totalMarks / batch.students.length;

    batchPerformances.push({
      id: batch.dataValues.id,
      average_accuracy: averageMarks,
    });
  }
  res.send({ status: 1, data: batchPerformances });
};

exports.getBatchDetailsById = async (req, res, next) => {
  try {
    const batchId = req.body.id;
    const batch = await Batch.findOne({
      include: [
        {
          model: Student,
          include: [
            {
              model: OverallPerformance,
            },
          ],
        },
      ],
      where: { id: req.body.id },
    });

    const totalAccuracy = batch.students.reduce((sum, student) => {
      console.log(student);
      if (student.overallPerformance) {
        console.log(student.overallPerformance.accuracy);
        return sum + student.overallPerformance.accuracy;
      } else {
        return sum;
      }
    }, 0);

    const averageAccuracy = totalAccuracy / batch.students.length;
    const data = {};
    data["id"] = batch.id;
    data["name"] = batch.name;
    data["description"] = batch.description;
    data["start_date"] = batch.startDate;
    data["average_accuracy"] = averageAccuracy;
    res.send({ status: 1, data: data });
    // console.log()
  } catch (e) {
    console.log(e);
  }
};

exports.deleteStudent = async (req, res, next) => {
  const studentId = req.body.studentId;
  Student.destroy({ where: { id: studentId } })
    .then((result) => {
      if (result) {
        res.json({
          status: 1,
          data: result,
          message: "Student deleted successfully",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: 0,
        data: null,
        message: "Something went wrong!",
      });
    });
};
