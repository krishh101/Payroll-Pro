const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const [[empStats]] = await db.execute(`
      SELECT 
        COUNT(*) as total_employees,
        SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active_employees,
        SUM(CASE WHEN status='inactive' THEN 1 ELSE 0 END) as inactive_employees,
        SUM(basic_salary) as total_salary_cost
      FROM employees
    `);

    const m = new Date().getMonth() + 1;
    const y = new Date().getFullYear();

    const [[payrollStats]] = await db.execute(`
      SELECT 
        SUM(net_salary) as monthly_payroll,
        SUM(total_deductions) as monthly_deductions,
        COUNT(*) as processed_count
      FROM payroll WHERE month=? AND year=? AND status != 'pending'
    `, [m, y]);

    const [[leaveStats]] = await db.execute(`
      SELECT 
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending_leaves,
        SUM(CASE WHEN status='approved' AND MONTH(start_date)=? AND YEAR(start_date)=? THEN 1 ELSE 0 END) as leaves_this_month
      FROM leaves
    `, [m, y]);

    const [deptBreakdown] = await db.execute(`
      SELECT d.name, COUNT(e.id) as count, SUM(e.basic_salary) as salary_total
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id AND e.status='active'
      GROUP BY d.id, d.name
    `);

    const [recentPayroll] = await db.execute(`
      SELECT p.month, p.year, SUM(p.net_salary) as total
      FROM payroll p
      GROUP BY p.year, p.month
      ORDER BY p.year DESC, p.month DESC
      LIMIT 6
    `);

    res.json({
      employees: empStats,
      payroll: payrollStats,
      leaves: leaveStats,
      department_breakdown: deptBreakdown,
      payroll_trend: recentPayroll.reverse(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPayrollReport = async (req, res) => {
  try {
    const { year } = req.query;
    const y = year || new Date().getFullYear();

    const [monthly] = await db.execute(`
      SELECT month, SUM(gross_salary) as gross, SUM(total_deductions) as deductions, SUM(net_salary) as net, COUNT(*) as count
      FROM payroll WHERE year=?
      GROUP BY month ORDER BY month ASC
    `, [y]);

    const [byDept] = await db.execute(`
      SELECT d.name as department, SUM(p.net_salary) as total_net, COUNT(p.id) as count
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE p.year=?
      GROUP BY d.id, d.name
    `, [y]);

    res.json({ monthly, by_department: byDept });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardStats, getPayrollReport };
