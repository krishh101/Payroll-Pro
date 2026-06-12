# 💼 PayrollPro — Employee Payroll Management System
### Advanced DBMS Project | React + Node.js + MySQL

---

## 🛠️ Tools & Technologies

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MySQL 8+ |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| HTTP Client | Axios |

---

## ✅ Prerequisites (Install These First)

1. **Node.js** (v18 or above) → https://nodejs.org
2. **MySQL** (v8 or above) → https://dev.mysql.com/downloads/
3. **VS Code** → https://code.visualstudio.com
4. **Git** → https://git-scm.com

### Recommended VS Code Extensions:
- **ES7+ React/Redux/React-Native snippets**
- **Prettier – Code formatter**
- **MySQL** by cweijan (for DB management inside VS Code)
- **Thunder Client** (API testing)
- **GitLens**

---

## 🚀 Setup Instructions 

### Step 1: Database Setup

1. Open MySQL Workbench or any MySQL client
2. Run the file: `database/schema.sql`
   ```sql
   SOURCE /path/to/database/schema.sql;
   ```
   OR paste the entire file content and execute.
3. Database `payroll_db` will be created with sample data.

### Step 2: Backend Setup

Open a terminal in VS Code:

```bash
cd backend
npm install
```

Edit `backend/.env` and set your MySQL password:
```
DB_PASSWORD=your_mysql_root_password
```

Start the backend:
```bash
npm run dev      # Development (with auto-reload)
# OR
npm start        # Production
```

✅ Backend runs at: **http://localhost:5000**

### Step 3: Frontend Setup

Open a **new terminal** in VS Code:

```bash
cd frontend
npm install
npm start
```

✅ Frontend runs at: **http://localhost:3000**


---

## 📁 Project Structure

```
employee-payroll-system/
├── backend/
│   ├── config/          → Database connection
│   ├── controllers/     → Business logic
│   ├── middleware/       → JWT authentication
│   ├── routes/          → API endpoints
│   ├── .env             → Environment config
│   ├── server.js        → Express entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/  → Sidebar, reusable UI
│       ├── context/     → Auth state management
│       ├── pages/       → Dashboard, Employees, Payroll...
│       ├── utils/       → Axios API config
│       └── App.jsx      → Routes
│
├── database/
│   └── schema.sql       → All tables + sample data
│
└── README.md


---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| GET | /api/auth/profile | Get profile |
| GET | /api/employees | List employees |
| POST | /api/employees | Create employee |
| PUT | /api/employees/:id | Update employee |
| DELETE | /api/employees/:id | Delete employee |
| GET | /api/departments | List departments |
| POST | /api/payroll/generate | Generate payroll |
| GET | /api/payroll | Get payroll records |
| PATCH | /api/payroll/:id/status | Update pay status |
| GET | /api/leaves | Get leave requests |
| PATCH | /api/leaves/:id/status | Approve/Reject leave |
| GET | /api/reports/dashboard | Dashboard stats |
| GET | /api/reports/payroll | Payroll report |

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Authentication & roles |
| `employees` | Employee profiles |
| `departments` | Department info |
| `payroll` | Monthly salary records |
| `salary_components` | Salary structure config |
| `leaves` | Leave requests |
| `attendance` | Daily attendance |
| `v_employee_details` | View: employee + dept |
| `v_payroll_summary` | View: payroll summary |

---

## 🔒 Role-Based Access

- **Admin**: Full access — all CRUD + delete
- **HR**: Manage employees, process payroll, approve leaves
- **Employee**: View own data, submit leave requests

---


