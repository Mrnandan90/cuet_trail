const e = require("express");

const studentController = require("../controllers/student");
const { authenticateToken } = require("../controllers/auth");

const router = e.Router();

router.get('/chart/last-test-performance', authenticateToken, studentController.getLastTestPerformance);
router.get('/chart/overall-performance', authenticateToken, studentController.getOverallPerformance);

router.get('/next-test', authenticateToken, studentController.getNextTest);

router.get('/remark', authenticateToken, studentController.getRemark);

router.post('/test/start', authenticateToken, studentController.startTest);
router.get('/test/questions', authenticateToken, studentController.getQuestions);
router.get('/test-performance/:testId', authenticateToken, studentController.getTestPerformance);

router.get('/list/test-list', authenticateToken, studentController.getTestList);

router.post('/test/submit/:testId', authenticateToken, studentController.submitTest);

router.post('/test/submit-answer/:questionId', authenticateToken, studentController.submitAnswer);

router.post('/create', studentController.createStudent);

router.post('/reset-password', studentController.passwordReset);

module.exports = router;
