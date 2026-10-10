const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const totalEmp = await db.query('SELECT COUNT(*) FROM employees');
    const activeEmp = await db.query("SELECT COUNT(*) FROM employees WHERE status = 'ACTIVE'");
    const totalDept = await db.query('SELECT COUNT(*) FROM departments');
    const todayAttendance = await db.query(
      "SELECT COUNT(*) FROM attendances WHERE work_date = CURRENT_DATE AND status = 'PRESENT'"
    );

    res.json({
      totalEmployees: parseInt(totalEmp.rows[0].count),
      activeEmployees: parseInt(activeEmp.rows[0].count),
      totalDepartments: parseInt(totalDept.rows[0].count),
      presentToday: parseInt(todayAttendance.rows[0].count),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};