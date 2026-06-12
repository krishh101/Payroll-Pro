-- ============================================
-- EMPLOYEE PAYROLL MANAGEMENT SYSTEM
-- Database: payroll_db
-- Compatible with: Node.js Backend Controllers
-- ============================================

DROP DATABASE IF EXISTS payroll_db;
CREATE DATABASE payroll_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE payroll_db;

-- ============================================
-- TABLE: users (authentication)
-- ============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','hr','employee') DEFAULT 'employee',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: departments
-- ============================================
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  manager_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: employees
-- ============================================
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department_id INT DEFAULT NULL,
  position VARCHAR(100),
  hire_date DATE,
  basic_salary DECIMAL(12,2) DEFAULT 0.00,
  status ENUM('active','inactive','terminated') DEFAULT 'active',
  gender ENUM('male','female','other'),
  date_of_birth DATE,
  address TEXT,
  bank_account VARCHAR(30),
  bank_name VARCHAR(100),
  nid VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABLE: salary_components
-- ============================================
CREATE TABLE salary_components (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('allowance','deduction') NOT NULL,
  calculation_type ENUM('fixed','percentage') DEFAULT 'percentage',
  value DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: payroll
-- ============================================
CREATE TABLE payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  basic_salary DECIMAL(12,2) NOT NULL,
  house_rent_allowance DECIMAL(12,2) DEFAULT 0.00,
  medical_allowance DECIMAL(12,2) DEFAULT 0.00,
  transport_allowance DECIMAL(12,2) DEFAULT 0.00,
  other_allowances DECIMAL(12,2) DEFAULT 0.00,
  gross_salary DECIMAL(12,2) NOT NULL,
  provident_fund DECIMAL(12,2) DEFAULT 0.00,
  income_tax DECIMAL(12,2) DEFAULT 0.00,
  other_deductions DECIMAL(12,2) DEFAULT 0.00,
  total_deductions DECIMAL(12,2) DEFAULT 0.00,
  net_salary DECIMAL(12,2) NOT NULL,
  working_days INT DEFAULT 26,
  present_days INT DEFAULT 26,
  overtime_hours DECIMAL(5,2) DEFAULT 0.00,
  overtime_pay DECIMAL(12,2) DEFAULT 0.00,
  status ENUM('pending','processed','paid') DEFAULT 'pending',
  processed_by INT DEFAULT NULL,
  processed_date TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_emp_month_year (employee_id, month, year),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABLE: leaves
-- ============================================
CREATE TABLE leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type ENUM('annual','sick','casual','maternity','paternity','unpaid') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INT NOT NULL,
  reason TEXT,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  approved_by INT DEFAULT NULL,
  approved_at TIMESTAMP NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABLE: attendance
-- ============================================
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status ENUM('present','absent','half_day','on_leave') DEFAULT 'present',
  UNIQUE KEY unique_emp_date (employee_id, date),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES (performance)
-- ============================================
CREATE INDEX idx_employees_dept ON employees(department_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_payroll_month_year ON payroll(month, year);
CREATE INDEX idx_payroll_status ON payroll(status);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_leaves_employee ON leaves(employee_id);

-- ============================================
-- VIEWS
-- ============================================
CREATE OR REPLACE VIEW v_employee_details AS
SELECT
  e.id,
  e.employee_code,
  CONCAT(e.first_name, ' ', e.last_name) AS full_name,
  e.email,
  e.phone,
  e.position,
  e.hire_date,
  e.basic_salary,
  e.status,
  e.gender,
  d.name AS department_name,
  d.id AS department_id
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id;

CREATE OR REPLACE VIEW v_payroll_summary AS
SELECT
  p.id,
  p.month,
  p.year,
  CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
  e.employee_code,
  d.name AS department_name,
  p.basic_salary,
  p.gross_salary,
  p.total_deductions,
  p.net_salary,
  p.status,
  p.processed_date
FROM payroll p
JOIN employees e ON p.employee_id = e.id
LEFT JOIN departments d ON e.department_id = d.id;

-- ============================================
-- SAMPLE DATA
-- All passwords = "password"
-- Hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ============================================

INSERT INTO users (name, email, password, role) VALUES
('System Admin',  'admin@payroll.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('HR Manager',    'hr@payroll.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hr'),
('John Smith',    'john@payroll.com',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),
('Sarah Johnson', 'sarah@payroll.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),
('Michael Lee',   'michael@payroll.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','employee'),
('Emily Davis',   'emily@payroll.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),
('Robert Brown',  'robert@payroll.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','employee');

INSERT INTO departments (name, description) VALUES
('Engineering',     'Software development and technical operations'),
('Human Resources', 'HR management and employee relations'),
('Finance',         'Financial operations and accounting'),
('Marketing',       'Brand and marketing strategy'),
('Operations',      'Business operations and logistics');

INSERT INTO employees (user_id, employee_code, first_name, last_name, email, phone, department_id, position, hire_date, basic_salary, status, gender, date_of_birth, address, bank_account, bank_name) VALUES
(2, 'EMP-001', 'Jane',    'Wilson',  'hr@payroll.com',      '01711111111', 2, 'HR Manager',         '2020-01-15', 75000.00, 'active', 'female', '1985-06-20', '123 Main St, Dhaka',       '1234567890', 'Dutch Bangla Bank'),
(3, 'EMP-002', 'John',    'Smith',   'john@payroll.com',    '01722222222', 1, 'Senior Developer',   '2021-03-01', 95000.00, 'active', 'male',   '1990-04-15', '45 Tech Avenue, Dhaka',    '2345678901', 'BRAC Bank'),
(4, 'EMP-003', 'Sarah',   'Johnson', 'sarah@payroll.com',   '01733333333', 1, 'Junior Developer',   '2022-06-15', 55000.00, 'active', 'female', '1995-08-22', '78 Developer Lane, Dhaka', '3456789012', 'Islami Bank'),
(5, 'EMP-004', 'Michael', 'Lee',     'michael@payroll.com', '01744444444', 3, 'Finance Analyst',    '2021-09-01', 70000.00, 'active', 'male',   '1988-12-10', '22 Finance Road, Dhaka',   '4567890123', 'Standard Bank'),
(6, 'EMP-005', 'Emily',   'Davis',   'emily@payroll.com',   '01755555555', 4, 'Marketing Lead',     '2020-11-20', 65000.00, 'active', 'female', '1992-03-30', '55 Marketing Blvd, Dhaka', '5678901234', 'Dutch Bangla Bank'),
(7, 'EMP-006', 'Robert',  'Brown',   'robert@payroll.com',  '01766666666', 5, 'Operations Manager', '2019-05-10', 80000.00, 'active', 'male',   '1983-07-18', '90 Ops Street, Dhaka',     '6789012345', 'BRAC Bank');

-- Update department managers
UPDATE departments SET manager_id = 1 WHERE id = 2;
UPDATE departments SET manager_id = 2 WHERE id = 1;
UPDATE departments SET manager_id = 4 WHERE id = 3;
UPDATE departments SET manager_id = 5 WHERE id = 4;
UPDATE departments SET manager_id = 6 WHERE id = 5;

INSERT INTO salary_components (name, type, calculation_type, value, description) VALUES
('House Rent Allowance', 'allowance', 'percentage', 40.00, '40% of basic salary'),
('Medical Allowance',    'allowance', 'percentage', 10.00, '10% of basic salary'),
('Transport Allowance',  'allowance', 'fixed',      3000.00, 'Fixed monthly transport'),
('Provident Fund',       'deduction', 'percentage', 10.00, '10% of basic salary'),
('Income Tax',           'deduction', 'percentage',  5.00, '5% of gross salary');

-- Payroll records: month=4 (April), year=2025
INSERT INTO payroll (employee_id, month, year, basic_salary, house_rent_allowance, medical_allowance, transport_allowance, other_allowances, gross_salary, provident_fund, income_tax, other_deductions, total_deductions, net_salary, working_days, present_days, overtime_hours, overtime_pay, status, processed_by, processed_date) VALUES
(1, 4, 2025,  75000.00, 30000.00,  7500.00, 3000.00, 0.00, 115500.00,  7500.00,  5775.00, 0.00, 13275.00, 102225.00, 26, 26, 0.00,    0.00, 'paid',      1, NOW()),
(2, 4, 2025,  95000.00, 38000.00,  9500.00, 3000.00, 0.00, 145500.00,  9500.00,  7275.00, 0.00, 16775.00, 128725.00, 26, 25, 4.00, 1460.00, 'paid',      1, NOW()),
(3, 4, 2025,  55000.00, 22000.00,  5500.00, 3000.00, 0.00,  85500.00,  5500.00,  4275.00, 0.00,  9775.00,  75725.00, 26, 26, 0.00,    0.00, 'paid',      1, NOW()),
(4, 4, 2025,  70000.00, 28000.00,  7000.00, 3000.00, 0.00, 108000.00,  7000.00,  5400.00, 0.00, 12400.00,  95600.00, 26, 24, 0.00,    0.00, 'processed', 1, NOW()),
(5, 4, 2025,  65000.00, 26000.00,  6500.00, 3000.00, 0.00, 100500.00,  6500.00,  5025.00, 0.00, 11525.00,  88975.00, 26, 26, 2.00, 1000.00, 'paid',      1, NOW()),
(6, 4, 2025,  80000.00, 32000.00,  8000.00, 3000.00, 0.00, 123000.00,  8000.00,  6150.00, 0.00, 14150.00, 108850.00, 26, 26, 0.00,    0.00, 'pending', NULL, NULL);

-- Payroll: month=3 (March), year=2025
INSERT INTO payroll (employee_id, month, year, basic_salary, house_rent_allowance, medical_allowance, transport_allowance, other_allowances, gross_salary, provident_fund, income_tax, other_deductions, total_deductions, net_salary, working_days, present_days, overtime_hours, overtime_pay, status, processed_by, processed_date) VALUES
(1, 3, 2025,  75000.00, 30000.00,  7500.00, 3000.00, 0.00, 115500.00,  7500.00,  5775.00, 0.00, 13275.00, 102225.00, 26, 26, 0.00, 0.00, 'paid', 1, NOW()),
(2, 3, 2025,  95000.00, 38000.00,  9500.00, 3000.00, 0.00, 145500.00,  9500.00,  7275.00, 0.00, 16775.00, 128725.00, 26, 26, 0.00, 0.00, 'paid', 1, NOW()),
(3, 3, 2025,  55000.00, 22000.00,  5500.00, 3000.00, 0.00,  85500.00,  5500.00,  4275.00, 0.00,  9775.00,  75725.00, 26, 26, 0.00, 0.00, 'paid', 1, NOW()),
(4, 3, 2025,  70000.00, 28000.00,  7000.00, 3000.00, 0.00, 108000.00,  7000.00,  5400.00, 0.00, 12400.00,  95600.00, 26, 26, 0.00, 0.00, 'paid', 1, NOW()),
(5, 3, 2025,  65000.00, 26000.00,  6500.00, 3000.00, 0.00, 100500.00,  6500.00,  5025.00, 0.00, 11525.00,  88975.00, 26, 26, 0.00, 0.00, 'paid', 1, NOW()),
(6, 3, 2025,  80000.00, 32000.00,  8000.00, 3000.00, 0.00, 123000.00,  8000.00,  6150.00, 0.00, 14150.00, 108850.00, 26, 26, 0.00, 0.00, 'paid', 1, NOW());

-- Leave records
INSERT INTO leaves (employee_id, leave_type, start_date, end_date, total_days, reason, status, approved_by, approved_at) VALUES
(2, 'annual',  '2025-01-20', '2025-01-24', 5, 'Family vacation',      'approved', 1, NOW()),
(3, 'sick',    '2025-02-10', '2025-02-12', 3, 'Fever and cold',       'approved', 1, NOW()),
(4, 'casual',  '2025-03-05', '2025-03-05', 1, 'Personal work',        'approved', 1, NOW()),
(5, 'annual',  '2025-04-14', '2025-04-18', 5, 'Eid vacation',         'pending',  NULL, NULL),
(6, 'sick',    '2025-04-21', '2025-04-22', 2, 'Not feeling well',     'pending',  NULL, NULL),
(1, 'casual',  '2025-05-01', '2025-05-01', 1, 'Personal appointment', 'pending',  NULL, NULL);

-- Attendance records
INSERT INTO attendance (employee_id, date, check_in, check_out, status) VALUES
(1, '2025-04-21', '09:00:00', '17:30:00', 'present'),
(2, '2025-04-21', '08:45:00', '18:00:00', 'present'),
(3, '2025-04-21', '09:15:00', '17:00:00', 'present'),
(4, '2025-04-21', NULL, NULL, 'absent'),
(5, '2025-04-21', '09:00:00', '13:00:00', 'half_day'),
(6, '2025-04-21', '09:30:00', '17:30:00', 'present'),
(1, '2025-04-22', '09:05:00', '17:35:00', 'present'),
(2, '2025-04-22', '08:50:00', '18:10:00', 'present'),
(3, '2025-04-22', '09:20:00', '17:05:00', 'present'),
(4, '2025-04-22', '09:00:00', '17:00:00', 'present'),
(5, '2025-04-22', '09:10:00', '17:00:00', 'present'),
(6, '2025-04-22', NULL, NULL, 'on_leave');

SELECT '=============================' AS '';
SELECT 'Database setup COMPLETE!' AS '';
SELECT 'Login: admin@payroll.com / password' AS '';
SELECT 'Login: hr@payroll.com / password' AS '';
SELECT 'Login: john@payroll.com / password' AS '';
SELECT '=============================' AS '';
