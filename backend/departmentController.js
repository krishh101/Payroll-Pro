const db = require('../config/db');

const getDepartments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT d.*, 
        CONCAT(e.first_name, ' ', e.last_name) AS manager_name,
        COUNT(emp.id) AS employee_count
      FROM departments d
      LEFT JOIN employees e ON d.manager_id = e.id
      LEFT JOIN employees emp ON d.id = emp.department_id AND emp.status = 'active'
      GROUP BY d.id
      ORDER BY d.name
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getDepartment = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM departments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Department not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, description, manager_id } = req.body;
    const [result] = await db.execute(
      'INSERT INTO departments (name, description, manager_id) VALUES (?, ?, ?)',
      [name, description, manager_id || null]
    );
    res.status(201).json({ message: 'Department created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { name, description, manager_id } = req.body;
    await db.execute(
      'UPDATE departments SET name=?, description=?, manager_id=? WHERE id=?',
      [name, description, manager_id || null, req.params.id]
    );
    res.json({ message: 'Department updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await db.execute('DELETE FROM departments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };
