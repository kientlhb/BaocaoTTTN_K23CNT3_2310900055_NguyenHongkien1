const db = require('../config/db');
const xlsx = require('xlsx');

// ==================== 1. QUẢN LÝ NHÂN SỰ (EMPLOYEES) ====================

const getAllEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    let query = `
      SELECT employee_code, full_name, email, phone, gender, birthday, address, 
             department, role, system_role, status, leave_days, COALESCE(salary, 10000000) AS salary 
      FROM employees 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (full_name ILIKE $${params.length} OR employee_code ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }
    if (department && department !== 'all') {
      params.push(department);
      query += ` AND department = $${params.length}`;
    }
    if (status && status !== 'all') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ' ORDER BY employee_code ASC';
    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('🔥 Lỗi SQL getAllEmployees:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

const createEmployee = async (req, res) => {
  const { full_name, email, phone, department, role, birthday, join_date, status, leave_days, system_role, salary } = req.body;
  try {
    const countRes = await db.query('SELECT COUNT(*) FROM employees');
    const nextNum = parseInt(countRes.rows[0].count) + 1;
    const employee_code = `NV${String(nextNum).padStart(3, '0')}`;
    const formattedLeave = leave_days ? (String(leave_days).includes('/') ? leave_days : `${leave_days}/${leave_days}`) : '12/12';

    // 3 quyền chuẩn kỹ thuật: admin, hr, employee
    const validSysRoles = ['admin', 'hr', 'employee'];
    const assignedSysRole = validSysRoles.includes(system_role?.toLowerCase()) ? system_role.toLowerCase() : 'employee';

    const result = await db.query(
      `INSERT INTO employees (
        employee_code, full_name, email, phone, department, role, birthday, join_date, leave_days, status, system_role, salary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        employee_code,
        full_name,
        email,
        phone || '0912 345 678',
        department || 'Phòng Kỹ thuật',
        role || 'Kỹ sư phần mềm',
        birthday || '12/04/1995',
        join_date || '23/09/2026',
        formattedLeave,
        status || 'Đang làm việc',
        assignedSysRole,
        salary || 10000000
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('🔥 Lỗi SQL createEmployee:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Cập nhật nhân viên: Chặn tuyệt đối HR đổi vai trò hệ thống (chỉ Admin mới được đổi)
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { 
    full_name, 
    email, 
    phone, 
    department, 
    role, 
    birthday, 
    join_date, 
    status, 
    leave_days, 
    system_role, 
    salary 
  } = req.body;

  const formattedLeave = leave_days ? (String(leave_days).includes('/') ? leave_days : `${leave_days}/${leave_days}`) : null;

  const currentUserRole = (req.user?.system_role || req.user?.role || '').toLowerCase();
  const currentUsername = (req.user?.username || req.user?.email || '').toLowerCase();
  const isAdmin = currentUserRole === 'admin' || currentUsername === 'admin' || currentUsername === 'quan.tm@congty.vn';

  const validSysRoles = ['admin', 'hr', 'employee'];
  const sanitizedSysRole = validSysRoles.includes(system_role?.toLowerCase()) ? system_role.toLowerCase() : 'employee';

  try {
    const result = await db.query(
      `UPDATE employees 
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           department = COALESCE($4, department),
           role = COALESCE($5, role), -- Chức danh chuyên môn thực tế ngoài đời
           birthday = COALESCE($6, birthday),
           join_date = COALESCE($7, join_date),
           leave_days = COALESCE($8, leave_days),
           status = COALESCE($9, status),
           -- Chỉ cập nhật system_role nếu là Admin, HR sửa sẽ tự động giữ nguyên quyền cũ:
           system_role = CASE WHEN $10 = TRUE THEN COALESCE($11, system_role) ELSE system_role END,
           salary = COALESCE($12, salary)
       WHERE id::text = $13 OR employee_code = $13
       RETURNING *`,
      [
        full_name, 
        email, 
        phone, 
        department, 
        role, 
        birthday, 
        join_date, 
        formattedLeave, 
        status, 
        isAdmin, 
        sanitizedSysRole, 
        salary, 
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('🔥 Lỗi SQL updateEmployee:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// ==================== 2. QUẢN LÝ ĐƠN TỪ & LỊCH NGHỈ ====================

const getRequests = async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = 'SELECT * FROM leave_requests WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (type && type !== 'all') {
      params.push(type);
      query += ` AND (request_type = $${params.length} OR type = $${params.length})`;
    }

    query += ' ORDER BY id DESC';
    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('🔥 Lỗi SQL getRequests:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

const updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, approved_by, approval_note } = req.body;
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} · ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  try {
    const result = await db.query(
      `UPDATE leave_requests 
       SET status = $1, 
           approved_by = $2, 
           approved_at = $3, 
           approval_note = $4 
       WHERE id::text = $5 OR request_code = $5 
       RETURNING *`,
      [status, approved_by || 'Trần Minh Quân (Quản lý)', timeStr, approval_note || (status === 'Đã duyệt' ? 'Đã duyệt qua hệ thống' : 'Từ chối đơn'), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn cần duyệt' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('🔥 Lỗi SQL updateRequestStatus:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

const createRequest = async (req, res) => {
  const { employee_name, employee_code, department, request_type, time_range, reason, avatar } = req.body;
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} · ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  try {
    const countRes = await db.query('SELECT COUNT(*) FROM leave_requests');
    const nextNum = 140 + parseInt(countRes.rows[0].count) + 1;
    const request_code = `DT-0${nextNum}`;

    const result = await db.query(
      `INSERT INTO leave_requests (
        request_code, employee_name, employee_code, department, 
        request_type, time_range, reason, submit_date, status, avatar
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        request_code,
        employee_name || 'Nguyễn Thu Hà',
        employee_code || 'NV002',
        department || 'Phòng Kỹ thuật',
        request_type || 'Bổ sung công',
        time_range || '18/09/2026 · 08:00 – 17:30',
        reason,
        timeStr,
        'Chờ duyệt',
        avatar || 'NH'
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('🔥 Lỗi SQL createRequest:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

const getCalendarEvents = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM leave_requests ORDER BY id DESC');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('🔥 Lỗi SQL getCalendarEvents:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// ==================== 3. CHẤM CÔNG (TIMESHEETS) ====================

const getTodayTimesheet = async (req, res) => {
  try {
    let employeeCode = req.user?.employee_code || req.user?.employeeCode || req.query.employeeCode;
    if (!employeeCode && req.user?.email) {
      const empRes = await db.query('SELECT employee_code FROM employees WHERE email = $1', [req.user.email]);
      employeeCode = empRes.rows[0]?.employee_code;
    }
    if (!employeeCode) employeeCode = 'NV002';

    const today = new Date().toISOString().slice(0, 10);
    const result = await db.query(
      `SELECT * FROM timesheets WHERE employee_code = $1 AND date = $2 LIMIT 1`,
      [employeeCode, today]
    );
    return res.status(200).json(result.rows[0] || null);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi lấy dữ liệu chấm công: ' + error.message });
  }
};

// Lấy dữ liệu bảng chấm công tháng: Quản lý / HR xem được tất cả các dòng đã nạp
const getMonthTimesheets = async (req, res) => {
  try {
    const month = req.query.month || '2026-09';
    const requestedEmpCode = req.query.employeeCode;

    const userRole = (req.user?.system_role || req.user?.role || '').toString().trim().toLowerCase();
    const userEmail = (req.user?.email || req.user?.username || '').toString().trim().toLowerCase();

    const isManagerOrHR = 
      ['admin', 'hr', 'quản lý', 'manager'].includes(userRole) || 
      userEmail.includes('admin') || 
      userEmail === 'quan.tm@congty.vn' ||
      userEmail.includes('nhansu') ||
      req.user?.department?.toLowerCase().includes('nhân sự');

    let query = `
      SELECT t.id, t.employee_code, e.full_name, e.department,
             TO_CHAR(t.date, 'YYYY-MM-DD') AS formatted_date, 
             t.time_in, t.time_out, t.status 
      FROM timesheets t
      LEFT JOIN employees e ON t.employee_code = e.employee_code
      WHERE TO_CHAR(t.date, 'YYYY-MM') = $1
    `;
    const params = [month];

    // Chỉ lọc 1 người nếu là nhân viên bình thường; Quản lý/HR xem toàn bộ công ty
    if (!isManagerOrHR) {
      const myCode = req.user?.employee_code || requestedEmpCode || 'NV002';
      params.push(myCode);
      query += ` AND t.employee_code = $${params.length}`;
    }

    query += ` ORDER BY t.date ASC, t.employee_code ASC`;

    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('🔥 Lỗi getMonthTimesheets:', error);
    return res.status(500).json({ message: 'Lỗi lấy bảng chấm công: ' + error.message });
  }
};

const checkInOut = async (req, res) => {
  try {
    let employeeCode = req.user?.employee_code || req.user?.employeeCode || req.body.employeeCode;
    if (!employeeCode && req.user?.email) {
      const empRes = await db.query('SELECT employee_code FROM employees WHERE email = $1', [req.user.email]);
      employeeCode = empRes.rows[0]?.employee_code;
    }
    if (!employeeCode) employeeCode = 'NV002';

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const existing = await db.query(
      `SELECT * FROM timesheets WHERE employee_code = $1 AND date = $2`,
      [employeeCode, today]
    );

    if (existing.rows.length === 0) {
      const status = timeStr > '08:30:00' ? 'Đi muộn' : 'Đúng giờ';
      const insert = await db.query(
        `INSERT INTO timesheets (employee_code, date, time_in, status)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [employeeCode, today, timeStr, status]
      );
      return res.status(200).json({
        message: 'Điểm danh vào ca (Check-in) thành công lúc ' + timeStr,
        data: insert.rows[0]
      });
    } else {
      const update = await db.query(
        `UPDATE timesheets 
         SET time_out = $1 
         WHERE employee_code = $2 AND date = $3 RETURNING *`,
        [timeStr, employeeCode, today]
      );
      return res.status(200).json({
        message: 'Điểm danh tan ca (Check-out) thành công lúc ' + timeStr,
        data: update.rows[0]
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi xử lý điểm danh: ' + error.message });
  }
};
// Cập nhật trực tiếp 1 bản ghi chấm công (Chỉ dành cho Admin & HR)
const updateTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { time_in, time_out, status } = req.body;

    const result = await db.query(
      `UPDATE timesheets 
       SET time_in = $1, 
           time_out = $2, 
           status = $3 
       WHERE id = $4 
       RETURNING *`,
      [time_in || null, time_out || null, status || 'Đúng giờ', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy dòng chấm công cần sửa!' });
    }

    return res.status(200).json({
      message: 'Cập nhật chấm công thành công!',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Lỗi updateTimesheet:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ: ' + error.message });
  }
};

// Import dữ liệu chấm công từ Excel (Xử lý dứt điểm lỗi invalid input syntax for type time)
const importTimesheets = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file Excel hoặc CSV!' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    let data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'File không có dữ liệu!' });
    }

    // Tự động tách nếu dữ liệu bị dồn vào 1 ô ngăn cách bằng dấu chấm phẩy (;)
    if (data.length > 0 && data[0].length === 1 && String(data[0][0]).includes(';')) {
      data = data.map(row => String(row[0] || '').split(';'));
    }

    if (data.length < 2) {
      return res.status(400).json({ message: 'File thiếu dòng tiêu đề hoặc dữ liệu!' });
    }

    const rawHeaders = data[0].map(h => String(h).replace(/^\uFEFF/, '').trim().toLowerCase());
    const findCol = (keys) => rawHeaders.findIndex(h => keys.some(k => h.includes(k.toLowerCase())));

    let empIdx = findCol(['mã nv', 'employee_code', 'manv', 'code', 'm? nv', 'nv']);
    let dateIdx = findCol(['ngày', 'date', 'ngay']);
    let inIdx = findCol(['giờ vào', 'time_in', 'gio vao', 'checkin', 'gi? v', 'vào', 'vao']);
    let outIdx = findCol(['giờ ra', 'time_out', 'gio ra', 'checkout', 'gi? r', 'ra']);
    let statusIdx = findCol(['trạng thái', 'status', 'trang thai', 'tr?ng', 'thái', 'thai']);

    if (empIdx === -1 && data[0].length >= 5) {
      empIdx = 0; dateIdx = 1; inIdx = 2; outIdx = 3; statusIdx = 4;
    }

    if (empIdx === -1 || dateIdx === -1) {
      return res.status(400).json({ 
        message: `Không nhận diện được cột. Các cột đọc được là: [${rawHeaders.join(' | ')}]` 
      });
    }

    let successCount = 0;
    const errors = [];

    // Hàm trích xuất đúng định dạng HH:mm:ss chuẩn PostgreSQL từ mọi kiểu dữ liệu của Excel
    const extractCleanTime = (val) => {
      if (!val) return null;
      if (val instanceof Date && !isNaN(val)) {
        const h = String(val.getHours()).padStart(2, '0');
        const m = String(val.getMinutes()).padStart(2, '0');
        const s = String(val.getSeconds()).padStart(2, '0');
        return `${h}:${m}:${s}`;
      }
      const str = String(val).trim();
      // Bóc tách lấy đúng cụm HH:mm:ss hoặc HH:mm từ chuỗi ngày tháng dài
      const match = str.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
      if (match) {
        const parts = match[1].split(':');
        const h = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const s = (parts[2] || '00').padStart(2, '0');
        return `${h}:${m}:${s}`;
      }
      return null;
    };

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0 || !row[empIdx]) continue;

      const empCode = String(row[empIdx]).trim();
      let rawDate = row[dateIdx];
      let timeIn = inIdx !== -1 ? extractCleanTime(row[inIdx]) : null;
      let timeOut = outIdx !== -1 ? extractCleanTime(row[outIdx]) : null;
      let status = statusIdx !== -1 && row[statusIdx] ? String(row[statusIdx]).trim() : 'Đúng giờ';

      // Chuẩn hóa ngày thành YYYY-MM-DD
      let formattedDate = '';
      if (rawDate instanceof Date && !isNaN(rawDate)) {
        formattedDate = rawDate.toISOString().slice(0, 10);
      } else if (typeof rawDate === 'string') {
        const clean = rawDate.trim();
        if (clean.includes('/')) {
          const parts = clean.split('/');
          if (parts.length === 3) formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        } else if (clean.includes('-')) {
          formattedDate = clean;
        }
      } else if (typeof rawDate === 'number') {
        const dObj = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
        formattedDate = dObj.toISOString().slice(0, 10);
      }

      if (!empCode || !formattedDate) {
        errors.push(`Dòng ${i + 1}: Thiếu Mã NV (${empCode}) hoặc Ngày (${rawDate})`);
        continue;
      }

      if (timeIn && timeIn > '08:30:00' && (status.includes('Đúng') || status.includes('?ng'))) {
        status = 'Đi muộn';
      }

      try {
        await db.query(
          `INSERT INTO timesheets (employee_code, date, time_in, time_out, status)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (employee_code, date)
           DO UPDATE SET
             time_in = COALESCE(EXCLUDED.time_in, timesheets.time_in),
             time_out = COALESCE(EXCLUDED.time_out, timesheets.time_out),
             status = EXCLUDED.status`,
          [empCode, formattedDate, timeIn, timeOut, status]
        );
        successCount++;
      } catch (err) {
        errors.push(`Dòng ${i + 1} (${empCode}): ${err.message}`);
      }
    }

    if (successCount === 0 && errors.length > 0) {
      return res.status(400).json({ message: 'Thất bại! Nguyên nhân: ' + errors.join('; ') });
    }

    return res.status(200).json({
      message: `Đã nhập thành công ${successCount} dòng chấm công.`,
      successCount
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server xử lý file: ' + error.message });
  }
};
// ==================== 4. TÍNH BẢNG LƯƠNG & XEM LƯƠNG ====================

const generatePayroll = async (req, res) => {
  try {
    const { month } = req.body;
    if (!month) {
      return res.status(400).json({ message: 'Vui lòng chọn tháng tính lương!' });
    }

    const ROLE_SALARY_MAP = { 
      admin: 25000000,
      hr: 14000000, 
      employee: 10000000, 
      default: 10000000 
    };
    const ROLE_ALLOWANCE_MAP = { 
      admin: 3000000,
      hr: 1500000, 
      employee: 1000000, 
      default: 1000000 
    };

    const emps = await db.query(
      `SELECT employee_code, full_name, department, role, system_role, salary FROM employees`
    );
    const standardDays = 22;

    for (const emp of emps.rows) {
      const rawRole = (emp.system_role || emp.role || 'employee').toString().trim().toLowerCase();

      let roleKey = 'employee';
      if (rawRole === 'admin') roleKey = 'admin';
      else if (rawRole === 'hr' || rawRole.includes('nhân sự')) roleKey = 'hr';

      const baseSalary = parseFloat(emp.salary) > 0 ? parseFloat(emp.salary) : (ROLE_SALARY_MAP[roleKey] || ROLE_SALARY_MAP.default);
      const allowance = ROLE_ALLOWANCE_MAP[roleKey] || ROLE_ALLOWANCE_MAP.default;

      const countRes = await db.query(
        `SELECT 
            COUNT(*) AS total_days,
            COUNT(CASE WHEN status = 'Đi muộn' THEN 1 END) AS late_days
         FROM timesheets 
         WHERE employee_code = $1 AND TO_CHAR(date, 'YYYY-MM') = $2`,
        [emp.employee_code, month]
      );

      let workingDays = parseFloat(countRes.rows[0]?.total_days || 0);
      const lateDays = parseInt(countRes.rows[0]?.late_days || 0);

      if (workingDays === 0) workingDays = 22;

      const deduction = lateDays * 100000;
      let netSalary = (baseSalary / standardDays) * workingDays + allowance - deduction;
      if (netSalary < 0) netSalary = 0;

      await db.query(
        `INSERT INTO payrolls (employee_code, month, base_salary, working_days, allowance, deduction, net_salary, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'Chờ thanh toán')
         ON CONFLICT (employee_code, month)
         DO UPDATE SET
           base_salary = EXCLUDED.base_salary,
           working_days = EXCLUDED.working_days,
           allowance = EXCLUDED.allowance,
           deduction = EXCLUDED.deduction,
           net_salary = EXCLUDED.net_salary`,
        [emp.employee_code, month, baseSalary, workingDays, allowance, deduction, Math.round(netSalary)]
      );
    }

    return res.status(200).json({ 
      message: `Đã tính xong bảng lương tháng ${month}!` 
    });
  } catch (error) {
    console.error('Lỗi tính lương:', error.message);
    return res.status(500).json({ message: 'Lỗi tính lương: ' + error.message });
  }
};

const getPayrolls = async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const requestedEmpCode = req.query.employeeCode;

    const userRole = (req.user?.system_role || req.user?.role || '').toLowerCase();
    const isPrivileged = ['hr', 'admin'].includes(userRole);

    let query = `
      SELECT p.id, p.employee_code, e.full_name, e.department, 
             COALESCE(e.role, e.system_role, 'Nhân viên') AS role,
             p.base_salary, p.working_days, p.allowance, p.deduction, p.net_salary, p.status
      FROM payrolls p
      JOIN employees e ON p.employee_code = e.employee_code
      WHERE p.month = $1
    `;
    const params = [month];

    if (!isPrivileged && requestedEmpCode) {
      params.push(requestedEmpCode);
      query += ` AND p.employee_code = $${params.length}`;
    }

    query += ` ORDER BY p.base_salary DESC, p.employee_code ASC`;

    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Lỗi lấy bảng lương:', error.message);
    return res.status(500).json({ message: 'Lỗi lấy bảng lương: ' + error.message });
  }
};

// ==================== 5. CHỨC NĂNG DÀNH RIÊNG CHO ADMIN ====================

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['employee', 'hr', 'admin'];
    if (!validRoles.includes(role?.toLowerCase())) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ!' });
    }

    const result = await db.query(
      `UPDATE employees 
       SET system_role = $1 
       WHERE employee_code = $2 OR id::text = $2 
       RETURNING employee_code, full_name, role, system_role`,
      [role.toLowerCase(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên!' });
    }

    return res.status(200).json({
      message: `Đã đổi quyền cho ${result.rows[0].full_name} thành ${role.toUpperCase()}`,
      employee: result.rows[0]
    });
  } catch (error) {
    console.error('Lỗi updateUserRole:', error.message);
    return res.status(500).json({ message: 'Lỗi cập nhật quyền: ' + error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      `UPDATE employees 
       SET status = $1 
       WHERE employee_code = $2 OR id::text = $2 
       RETURNING employee_code, full_name, status`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên!' });
    }

    return res.status(200).json({
      message: `Cập nhật trạng thái thành công!`,
      employee: result.rows[0]
    });
  } catch (error) {
    console.error('Lỗi toggleUserStatus:', error.message);
    return res.status(500).json({ message: 'Lỗi đổi trạng thái: ' + error.message });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const defaultPassword = '123456'; 

    await db.query(
      `UPDATE employees 
       SET password = $1 
       WHERE employee_code = $2 OR id::text = $2`,
      [defaultPassword, id]
    );

    return res.status(200).json({ message: 'Đã reset mật khẩu của nhân viên về: 123456' });
  } catch (error) {
    console.error('Lỗi resetUserPassword:', error.message);
    return res.status(500).json({ message: 'Lỗi reset mật khẩu: ' + error.message });
  }
};

// ==================== 6. EXPORT ĐẦY ĐỦ CÁC HÀM ====================
module.exports = {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  getRequests,
  updateRequestStatus,
  createRequest,
  getCalendarEvents,
  getTodayTimesheet,
  getMonthTimesheets,
  checkInOut,
  importTimesheets,
  generatePayroll,
  getPayrolls,
  updateUserRole,
  toggleUserStatus,
  resetUserPassword,
  updateTimesheet
};