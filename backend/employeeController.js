const db = require('../config/db');

// GET all employees
const getEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    let query = `
      SELECT e.*, d.name AS department_name,
        CONCAT(e.first_name, ' ', e.last_name) AS full_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR e.employee_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (department) { query += ' AND e.department_id = ?'; params.push(department); }
    if (status) { query += ' AND e.status = ?'; params.push(status); }
    query += ' ORDER BY e.id DESC';

    const [employees] = await db.execute(query, params);
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET single employee
const getEmployee = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT e.*, d.name AS department_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Employee not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST create employee
const createEmployee = async (req, res) => {
  try {
    const {
      user_id, employee_code, first_name, last_name, email, phone,
      department_id, position, hire_date, basic_salary, status,
      gender, date_of_birth, address, bank_account, bank_name, nid
    } = req.body;

    // Check duplicate email/code
    const [existing] = await db.execute(
      'SELECT id FROM employees WHERE email = ? OR employee_code = ?',
      [email, employee_code]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Employee with this email or code already exists' });
    }

    const [result] = await db.execute(
      `INSERT INTO employees 
        (user_id, employee_code, first_name, last_name, email, phone, department_id, position, hire_date, basic_salary, status, gender, date_of_birth, address, bank_account, bank_name, nid) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id || null, employee_code, first_name, last_name, email, phone, department_id, position, hire_date, basic_salary || 0, status || 'active', gender, date_of_birth, address, bank_account, bank_name, nid]
    );

    res.status(201).json({ message: 'Employee created successfully', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT update employee
const updateEmployee = async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, department_id, position,
      hire_date, basic_salary, status, gender, date_of_birth,
      address, bank_account, bank_name, nid
    } = req.body;

    await db.execute(
      `UPDATE employees SET 
        first_name=?, last_name=?, email=?, phone=?, department_id=?, position=?,
        hire_date=?, basic_salary=?, status=?, gender=?, date_of_birth=?,
        address=?, bank_account=?, bank_name=?, nid=?
       WHERE id=?`,
      [first_name, last_name, email, phone, department_id, position,
       hire_date, basic_salary, status, gender, date_of_birth,
       address, bank_account, bank_name, nid, req.params.id]
    );

    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE employee
const deleteEmployee = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id FROM employees WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Employee not found' });

    await db.execute('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET employee stats (for dashboard)
const getStats = async (req, res) => {
  try {
    const [[{ total }]] = await db.execute('SELECT COUNT(*) as total FROM employees');
    const [[{ active }]] = await db.execute("SELECT COUNT(*) as active FROM employees WHERE status='active'");
    const [[{ new_this_month }]] = await db.execute(
      "SELECT COUNT(*) as new_this_month FROM employees WHERE MONTH(hire_date) = MONTH(NOW()) AND YEAR(hire_date) = YEAR(NOW())"
    );
    const [deptStats] = await db.execute(
      'SELECT d.name, COUNT(e.id) as count FROM departments d LEFT JOIN employees e ON d.id = e.department_id AND e.status="active" GROUP BY d.id, d.name'
    );
    res.json({ total, active, new_this_month, departments: deptStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, getStats };
