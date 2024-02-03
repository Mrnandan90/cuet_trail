const e = require("express");

const studentController = require("../controllers/student");

const router = e.Router();

router.get('/chart/last-test-performance', studentController.getLastTestPerformance);
router.get('/chart/overall-performance', studentController.getOverallPerformance);

router.get('/next-test', studentController.getNextTest);

router.get('/remark', studentController.getRemark);

router.post('/test/start', studentController.startTest);
router.get('/test/questions', studentController.getQuestions);
router.get('/test/performance', studentController.getTestPerformance);

router.get('/list/test-list', studentController.getTestList);

router.post('/test/submit', studentController.submitTest);

router.post('/create', studentController.createStudent);

module.exports = router;
