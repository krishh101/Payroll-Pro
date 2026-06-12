const db = require('../config/db');

const getLeaves = async (req, res) => {
  try {
    const { status, employee_id, leave_type } = req.query;
    let query = `
      SELECT l.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.employee_code, d.name AS department_name
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    if (status) { query += ' AND l.status = ?'; params.push(status); }
    if (employee_id) { query += ' AND l.employee_id = ?'; params.push(employee_id); }
    if (leave_type) { query += ' AND l.leave_type = ?'; params.push(leave_type); }
    query += ' ORDER BY l.created_at DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getLeave = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT l.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name
       FROM leaves l JOIN employees e ON l.employee_id = e.id
       WHERE l.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Leave not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createLeave = async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;

    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const [result] = await db.execute(
      'INSERT INTO leaves (employee_id, leave_type, start_date, end_date, total_days, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [employee_id, leave_type, start_date, end_date, days, reason]
    );
    res.status(201).json({ message: 'Leave request submitted', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await db.execute(
      'UPDATE leaves SET status=?, approved_by=?, approved_at=NOW(), rejection_reason=? WHERE id=?',
      [status, req.user.id, rejection_reason || null, req.params.id]
    );
    res.json({ message: `Leave ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteLeave = async (req, res) => {
  try {
    await db.execute('DELETE FROM leaves WHERE id = ?', [req.params.id]);
    res.json({ message: 'Leave deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getLeaveStats = async (req, res) => {
  try {
    const [[stats]] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) as rejected
      FROM leaves
    `);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getLeaves, getLeave, createLeave, updateLeaveStatus, deleteLeave, getLeaveStats };
