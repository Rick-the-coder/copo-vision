# COPO Vision: Predictive Analytics Platform for NBA Outcome Attainment

This is Phase 1 of the COPO Vision software project. It provides the core foundational architecture, including the database, authentication, and Master Data management for Departments, Courses, Subjects, Academic Years, Semesters, Faculty, Students, and Users.

## Features Completed in Phase 1
- **Database setup**: PostgreSQL via SQLAlchemy and Alembic migrations.
- **Authentication**: JWT-based stateless authentication, bcrypt password hashing.
- **RBAC**: Role-Based Access Control middleware for Admin, HOD, Faculty, and Students.
- **Backend APIs**: Full CRUD operations for all Master Data modules.
- **Frontend App**: React, TypeScript, Vite, Tailwind CSS.
- **Dashboard UI**: Fully functional Dashboard Layout with navigation and routing.
- **Data Tables**: Interactive Master Data grids with add, edit, delete, and search functionality.

*Note: AI Prediction, CO Calculation, PO Calculation, Analytics, and Reports are reserved for Phase 2 and have not been implemented in this phase.*

---

## Project Structure Documentation

The project is built as a monorepo consisting of a FastAPI backend and a React frontend.

```
COPO Vision/
├── backend/
│   ├── alembic/              # Database migration scripts
│   ├── app/
│   │   ├── api/              # API Routers (v1 endpoints)
│   │   ├── core/             # Core config and security (JWT, hashing)
│   │   ├── crud/             # CRUD utility classes for database operations
│   │   ├── db/               # SQLAlchemy Session and Base classes
│   │   ├── models/           # SQLAlchemy ORM Models (Tables)
│   │   ├── schemas/          # Pydantic validation schemas
│   │   └── main.py           # FastAPI application entry point
│   ├── .env                  # Backend environment variables
│   ├── requirements.txt      # Python dependencies
│   └── seed.py               # Database seeding script (Admin credentials)
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components (DashboardLayout)
    │   ├── pages/            # React pages (Landing, Login, Master Data grids)
    │   ├── services/         # Axios API client with interceptors
    │   ├── App.tsx           # React Router configuration
    │   └── main.tsx          # React application entry point
    ├── tailwind.config.js    # Tailwind CSS configuration
    └── package.json          # Node.js dependencies
```

---

## Installation Guide

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL Server running locally or remotely

### Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your `.env` file (see Environment Variables below).
5. Run Alembic migrations to create the tables:
   ```bash
   export PYTHONPATH=.
   alembic upgrade head
   ```
6. Run the database seed script to create the initial Admin user:
   ```bash
   python seed.py
   ```
   *Default login: `admin@copovision.com` / `adminpassword`*
7. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will be available at `http://localhost:8000`. Swagger documentation is at `/docs`.

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the frontend in your browser at `http://localhost:5173`.

---

## Environment Variables

The backend requires an `.env` file in the `backend/` directory with the following keys:

```ini
PROJECT_NAME="COPO Vision API"
API_V1_STR="/api/v1"
SECRET_KEY="<A_VERY_SECURE_RANDOM_STRING_HERE>"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# PostgreSQL Configuration
POSTGRES_SERVER="localhost"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="password"
POSTGRES_DB="copovision"
```
*(Ensure `POSTGRES_USER` matches your local Mac user or postgres superuser).*
