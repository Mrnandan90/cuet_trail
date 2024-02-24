const e = require("express");

const adminController = require("../controllers/admin");
const { authenticateAdminToken } = require("../controllers/auth");

const router = e.Router();

router.get('/card/best-10-performing-students', authenticateAdminToken, adminController.get10BestPerformingStudent);
router.get('/card/worst-10-performing-students', authenticateAdminToken, adminController.get10WorstPerformingStudent);
router.get('/card/last-test-date', authenticateAdminToken, adminController.getLastTestDate);

router.get('/info/get-student-count', authenticateAdminToken, adminController.getStudentCount);
router.get('/info/get-test-count', authenticateAdminToken, adminController.getTestCount);
router.get('/info/get-batch-count', authenticateAdminToken, adminController.getBatchCount);
router.get('/info/get-count-info', authenticateAdminToken, adminController.getCountInfo);

router.get('/doughnut/get-performance-ratio', authenticateAdminToken, adminController.getOverallPerformanceRatio);
router.get('/doughnut/get-all-batch-performance', authenticateAdminToken, adminController.getAllBatchPerformance);

router.get('/list/get-batch-list', authenticateAdminToken, adminController.getBatchList);
router.get('/list/get-student-list', authenticateAdminToken, adminController.getStudentList);

router.get('/details/get-batch-details', authenticateAdminToken, adminController.getBatchDetailsById);

router.post('/batch/create-batch', authenticateAdminToken, adminController.createBatch);
router.post('/test/schedule-test', authenticateAdminToken, adminController.scheduleTest);
router.post('/test/add-questions', authenticateAdminToken, adminController.addQuestions);
// router.post('/generate-token', generate);

module.exports = router;
