const express = require('express');
const router = express.Router();
const hrmController = require('../controllers/hrmController');

// Routes Nhân viên
router.get('/employees', hrmController.getAllEmployees);
router.post('/employees', hrmController.createEmployee);

// Routes Duyệt đơn
router.get('/requests', hrmController.getRequests);
router.patch('/requests/:id/status', hrmController.updateRequestStatus);

// Routes Lịch nghỉ
router.get('/calendar', hrmController.getCalendarEvents);

// Routes sửa thông tin nhân viên
router.put('/employees/:id', hrmController.updateEmployee);

// Routes Tạo đơn mới
router.post('/requests', hrmController.createRequest);

module.exports = router;