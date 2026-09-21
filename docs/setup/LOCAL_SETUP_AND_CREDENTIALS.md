# COPO Vision — Local Setup & Credentials Guide

**Target System:** COPO Vision Academic Analytics Platform  
**Environment:** Local Development (Flask 3.x Backend + React/Vite Frontend + MySQL)  

---

## 1. Quick Service URLs & Ports

| Service | Technology | Local URL | Default Port |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | React / Vite / TailwindCSS | [http://localhost:5173](http://localhost:5173) | `5173` |
| **Backend API Server** | Python / Flask 3.x | [http://127.0.0.1:5000](http://127.0.0.1:5000) | `5000` |
| **Backend Health Check**| JSON Endpoint | [http://127.0.0.1:5000/health](http://127.0.0.1:5000/health) | `5000` |
| **Database Server** | MySQL 8.0 (`MySQL80`) | `127.0.0.1` | `3306` |

---

## 2. Default Login Credentials (All 4 Roles)

Use these realistic credentials to log in and test role-specific features and dashboards:

| Role | Persona / Full Name | Email / Username | Default Password | Permissions / Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** *(Superadmin)* | **Dr. Rajesh Sharma**<br>*(Dean of Academics & Admin)* | `admin@copovision.edu` | `Admin@123` | • Global Dashboard & System Settings<br>• User & Role Management<br>• Global Attainment & ML Model Training |
| **HOD** *(Head of Dept)* | **Prof. Sneha Kulkarni**<br>*(HOD - Computer Science)* | `hod.cse@copovision.edu` | `Hod@123` | • Department-level Analytics<br>• Course & Subject Curriculum Blueprints<br>• Department Batch Recalculations & Alerts |
| **Faculty** *(Course Instructor)* | **Dr. Amit Verma**<br>*(Assistant Professor - CSE)* | `amit.verma@copovision.edu` | `Faculty@123` | • Assigned Subject Blueprints<br>• Marks Entry & CSV/Excel Upload<br>• Course Outcome (CO) Attainments |
| **Student** *(Undergraduate)* | **Aarav Mehta**<br>*(4th Sem B.Tech CSE)* | `aarav.mehta@copovision.edu`<br>*(Enrollment: `EN2024CS0101`)* | `Student@123` | • Student Progress Card<br>• Personal CO/PO Attainment View<br>• Risk Alerts & Predictive Scorecard |

---

## 3. Step-by-Step Project Start Commands

### Step 1: Verify / Start Database (MySQL)
MySQL runs as a Windows service named `MySQL80`.

To check status or start via PowerShell (Run as Administrator):
```powershell
# Check MySQL status
Get-Service MySQL80

# If stopped, start it
Start-Service MySQL80
```

---

### Step 2: Start Backend Server (Flask)
Open a new terminal (**Terminal 1**) and run:

```powershell
# Navigate to backend directory
cd d:\Desktop\copo-vision\backend

# Run Flask server
python app.py
```
*Backend will start on:* `http://127.0.0.1:5000`

---

### Step 3: Start Frontend Server (React / Vite)
Open another terminal (**Terminal 2**) and run:

```powershell
# Navigate to frontend directory
cd d:\Desktop\copo-vision\frontend

# Install dependencies (only required on first run)
npm install

# Start Vite development server
npm run dev
```
*Frontend will start on:* `http://localhost:5173`

---

## 4. Useful Testing & Verification Commands

### Run Backend Security & Authorization Tests:
```powershell
cd d:\Desktop\copo-vision\backend
pytest -v tests/test_auth_enforcement.py tests/test_rbac_enforcement.py
```

### Seed a New Test User Account (CLI):
```powershell
cd d:\Desktop\copo-vision\backend

# Set environment variables for the test user
$env:SEED_USERNAME="faculty_test"
$env:SEED_USER_PASSWORD="Faculty@123"
$env:SEED_FULL_NAME="Dr. Test Faculty"
$env:SEED_ROLE="faculty"

# Execute seeding script
python create_user.py
```

---

## 5. Troubleshooting & FAQ

1. **Backend shows `Access denied for user ''@'localhost'`?**
   * Make sure MySQL credentials in `backend/config/database.py` or `.env` match your local MySQL root password.
2. **Port 5000 already in use?**
   * Check running python processes: `Get-Process python*`
   * Stop old instance or change port in `backend/app.py`.
3. **Frontend not connecting to backend?**
   * Verify backend is running on `http://127.0.0.1:5000`.
   * Check browser console (`F12` $\to$ Network tab) for `OPTIONS` or `CORS` errors.

---
*Document saved in root repository directory for quick access.*
