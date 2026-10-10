const db = require('../config/db');

exports.getEmployees = async (req, res) => {
  try {
    const query = `
      SELECT e.*, d.name AS department_name, p.title AS position_title
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      ORDER BY e.id DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createEmployee = async (req, res) => {
  const { employee_code, full_name, email, phone, gender, department_id, position_id } = req.body;
  try {
    const query = `
      INSERT INTO employees (employee_code, full_name, email, phone, gender, department_id, position_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await db.query(query, [employee_code, full_name, email, phone, gender, department_id, position_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone, gender, department_id, position_id, status } = req.body;
  try {
    const query = `
      UPDATE employees
      SET full_name=$1, email=$2, phone=$3, gender=$4, department_id=$5, position_id=$6, status=$7
      WHERE id=$8 RETURNING *
    `;
    const result = await db.query(query, [full_name, email, phone, gender, department_id, position_id, status, id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM employees WHERE id = $1', [id]);
    res.json({ message: 'Xóa nhân viên thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};