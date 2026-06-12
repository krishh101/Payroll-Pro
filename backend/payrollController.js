const db = require('../config/db');

// GET all payroll records
const getPayrolls = async (req, res) => {
  try {
    const { month, year, status, employee_id } = req.query;
    let query = `
      SELECT p.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.employee_code, d.name AS department_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    if (month) { query += ' AND p.month = ?'; params.push(month); }
    if (year) { query += ' AND p.year = ?'; params.push(year); }
    if (status) { query += ' AND p.status = ?'; params.push(status); }
    if (employee_id) { query += ' AND p.employee_id = ?'; params.push(employee_id); }
    query += ' ORDER BY p.year DESC, p.month DESC, e.first_name ASC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET single payroll
const getPayroll = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.employee_code, e.position, e.bank_account, e.bank_name,
        d.name AS department_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Payroll not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST generate payroll for a month
const generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) return res.status(400).json({ message: 'Month and year required' });

    // Get all active employees
    const [employees] = await db.execute(
      "SELECT * FROM employees WHERE status = 'active'"
    );

    let created = 0, skipped = 0;

    for (const emp of employees) {
      // Skip if already exists
      const [existing] = await db.execute(
        'SELECT id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?',
        [emp.id, month, year]
      );
      if (existing.length > 0) { skipped++; continue; }

      const basic = parseFloat(emp.basic_salary);
      const hra = basic * 0.40;
      const medical = basic * 0.10;
      const transport = 3000;
      const gross = basic + hra + medical + transport;
      const pf = basic * 0.10;
      const tax = gross * 0.05;
      const totalDed = pf + tax;
      const net = gross - totalDed;

      await db.execute(
        `INSERT INTO payroll 
          (employee_id, month, year, basic_salary, house_rent_allowance, medical_allowance,
           transport_allowance, gross_salary, provident_fund, income_tax, total_deductions, net_salary, status, processed_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [emp.id, month, year, basic, hra, medical, transport, gross, pf, tax, totalDed, net, req.user.id]
      );
      created++;
    }

    res.status(201).json({
      message: `Payroll generated: ${created} created, ${skipped} already existed`,
      created, skipped
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT update payroll record
const updatePayroll = async (req, res) => {
  try {
    const {
      basic_salary, house_rent_allowance, medical_allowance, transport_allowance,
      other_allowances, provident_fund, income_tax, other_deductions,
      working_days, present_days, overtime_hours, overtime_pay, notes
    } = req.body;

    const gross = parseFloat(basic_salary) + parseFloat(house_rent_allowance) +
      parseFloat(medical_allowance) + parseFloat(transport_allowance) +
      parseFloat(other_allowances || 0) + parseFloat(overtime_pay || 0);
    const totalDed = parseFloat(provident_fund) + parseFloat(income_tax) + parseFloat(other_deductions || 0);
    const net = gross - totalDed;

    await db.execute(
      `UPDATE payroll SET basic_salary=?, house_rent_allowance=?, medical_allowance=?,
        transport_allowance=?, other_allowances=?, gross_salary=?, provident_fund=?,
        income_tax=?, other_deductions=?, total_deductions=?, net_salary=?,
        working_days=?, present_days=?, overtime_hours=?, overtime_pay=?, notes=?
       WHERE id=?`,
      [basic_salary, house_rent_allowance, medical_allowance, transport_allowance,
       other_allowances || 0, gross, provident_fund, income_tax, other_deductions || 0,
       totalDed, net, working_days, present_days, overtime_hours || 0, overtime_pay || 0,
       notes, req.params.id]
    );

    res.json({ message: 'Payroll updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT mark payroll as processed/paid
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'processed', 'paid'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    await db.execute(
      'UPDATE payroll SET status=?, processed_by=?, processed_date=NOW() WHERE id=?',
      [status, req.user.id, req.params.id]
    );
    res.json({ message: `Payroll marked as ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET payroll summary stats
const getPayrollStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();

    const [[stats]] = await db.execute(`
      SELECT 
        COUNT(*) as total_records,
        SUM(gross_salary) as total_gross,
        SUM(total_deductions) as total_deductions,
        SUM(net_salary) as total_net,
        SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status='processed' THEN 1 ELSE 0 END) as processed_count
      FROM payroll WHERE month=? AND year=?
    `, [m, y]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getPayrolls, getPayroll, generatePayroll, updatePayroll, updateStatus, getPayrollStats };
