const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const db = require('../config/db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const hrmController = require('../controllers/hrmController');

// Authentication
router.post('/auth/login', authController.login);
if (authController.forgotPassword) {
  router.post('/auth/forgot-password', authController.forgotPassword);
}

// ==================== MIDDLEWARE PHÂN QUYỀN ====================

// 1. Chỉ dành riêng cho Admin (Nhận diện triệt để role và username)
const requireAdmin = (req, res, next) => {
  const role = (req.user?.role || req.user?.system_role || '').toString().trim().toLowerCase();
  const username = (req.user?.username || req.user?.email || '').toString().trim().toLowerCase();
  
  if (
    role === 'admin' || 
    username === 'admin' || 
    username === 'quan.tm@congty.vn'
  ) {
    return next();
  }
  return res.status(403).json({ message: 'Truy cập bị từ chối: Chức năng chỉ dành riêng cho Admin!' });
};

// 2. Dành cho Admin hoặc HR (Dùng cho upload file Excel chấm công)
const requireAdminOrHR = (req, res, next) => {
  const role = (req.user?.role || req.user?.system_role || '').toString().trim().toLowerCase();
  const username = (req.user?.username || req.user?.email || '').toString().trim().toLowerCase();

  if (
    role === 'admin' || 
    role === 'hr' || 
    username === 'admin' || 
    username === 'quan.tm@congty.vn' ||
    req.user?.department?.toLowerCase().includes('nhân sự')
  ) {
    return next();
  }
  return res.status(403).json({ message: 'Truy cập bị từ chối: Chỉ Admin hoặc HR mới được phép thực hiện!' });
};

// ==================== CÁC ROUTE QUẢN TRỊ VIÊN (ADMIN) ====================
router.put('/admin/users/:id/role', auth, requireAdmin, hrmController.updateUserRole);
router.put('/admin/users/:id/status', auth, requireAdmin, hrmController.toggleUserStatus);
router.post('/admin/users/:id/reset-password', auth, requireAdmin, hrmController.resetUserPassword);

// Dashboard
router.get('/dashboard/stats', auth, dashboardController.getStats);

// Employees CRUD
router.get('/employees', auth, hrmController.getAllEmployees);
router.post('/employees', auth, hrmController.createEmployee);
router.put('/employees/:id', auth, hrmController.updateEmployee);

// Danh mục phụ trợ
router.get('/departments', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM departments ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/positions', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM positions ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quản lý đơn từ & Lịch
router.get('/requests', auth, hrmController.getRequests);
router.post('/requests', auth, hrmController.createRequest);
router.put('/requests/:id', auth, hrmController.updateRequestStatus);
router.get('/calendar', auth, hrmController.getCalendarEvents);

// Chấm công
router.get('/timesheets/today', auth, hrmController.getTodayTimesheet);
router.get('/timesheets/month', auth, hrmController.getMonthTimesheets);
router.post('/timesheets/checkin', auth, hrmController.checkInOut);

// Nạp file Excel: Đã gắn middleware chỉ cho Admin hoặc HR thực hiện
router.post(
  '/timesheets/import', 
  auth, 
  requireAdminOrHR, 
  upload.single('file'), 
  hrmController.importTimesheets
);

// Bảng lương
router.get('/payrolls', auth, hrmController.getPayrolls);
router.post('/payrolls/generate', auth, requireAdminOrHR, hrmController.generatePayroll);

// Route sửa trực tiếp chấm công (Được bảo vệ bởi requireAdminOrHR)
router.put('/timesheets/:id', auth, requireAdminOrHR, hrmController.updateTimesheet);

module.exports = router;