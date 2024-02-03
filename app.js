const e = require("express");
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv").config();

const adminRoutes = require("./routes/admin");
const studentRoutes = require("./routes/student");
const auth = require("./controllers/auth");
const sequelize = require("./util/database");

const Student = require("./models/student");
const Test = require("./models/test");
const TestItem = require("./models/testItem");
const Batch = require("./models/batch");
const Question = require("./models/question");
const Answer = require("./models/answer");
const Performance = require("./models/performance");
const OverallPerformance = require("./models/overallPerformance");

const app = e();

app.use(e.urlencoded({ extended: true }));
app.use(e.json());
app.use(cookieParser());

app.post('/student/auth', auth.studentLogin)
app.post('/admin/auth', auth.adminLogin)
// app.post('/verify-auth', auth.authenticateToken);
// app.post('/verify-admin-auth', auth.authenticateAdminToken);
app.use("/admin", adminRoutes);
app.use("/student", studentRoutes);

app.use("*", (req, res, next) => {
  const data = {};
  data["status"] = 0;
  data["message"] = "404 Not Found! Invalid request!";
  res.status(404);
  res.json(data);
});

Student.belongsTo(Batch);
Batch.hasMany(Student);
Test.belongsTo(Batch);
Batch.hasMany(Test);
Question.belongsTo(Test);
Test.hasMany(Question);
Answer.belongsTo(Question);
Question.hasMany(Answer);
Answer.belongsTo(Student);
Student.hasMany(Answer);
Performance.belongsTo(Test);
Test.hasMany(Performance);
Performance.belongsTo(Student);
Student.hasMany(Performance);
OverallPerformance.belongsTo(Student);
Student.hasOne(OverallPerformance);
Test.hasMany(TestItem);
Student.hasMany(TestItem);
TestItem.belongsTo(Test);
TestItem.belongsTo(Student);

sequelize
  // .sync({force: true})
  .sync()
  .then((result) => {
    app.listen(process.env.PORT || 4000);
  })
  .catch((err) => {
    console.log(err);
  });
