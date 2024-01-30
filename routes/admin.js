const e = require("express");

const adminController = require("../controllers/admin");

const router = e.Router();

router.get('/card/best-10-performing-students', adminController.get10BestPerformingStudent);
router.get('/card/worst-10-performing-students', adminController.get10WorstPerformingStudent);
router.get('/card/last-test-date', adminController.getLastTestDate);

router.get('/info/get-student-count', adminController.getStudentCount);
router.get('/info/get-test-count', adminController.getTestCount);
router.get('/info/get-batch-count', adminController.getBatchCount);

router.get('/doughnut/get-performance-ratio', adminController.getOverallPerformanceRatio);
router.get('/doughnut/get-all-batch-performance', adminController.getAllBatchPerformance);

router.get('/list/get-batch-list', adminController.getBatchList);
router.get('/list/get-student-list', adminController.getStudentList);

router.get('/details/get-batch-details', adminController.getBatchDetailsById);

router.post('/batch/create-batch', adminController.createBatch);
router.post('/test/schedule-test', adminController.scheduleTest);
router.post('/test/add-questions', adminController.addQuestions);

module.exports = router;
