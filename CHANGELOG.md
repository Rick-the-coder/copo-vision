# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Feature planning for Phase 2: AI Prediction, CO Calculation, PO Calculation, Analytics, and Reports.

## [1.0.0] - Phase 1 Finalization

### Added
- **Database setup**: PostgreSQL via SQLAlchemy and Alembic migrations.
- **Authentication**: JWT-based stateless authentication, bcrypt password hashing.
- **RBAC Architecture**: Role-Based Access Control middleware for Admin, HOD, Faculty, and Students.
- **Backend APIs**: Full CRUD operations for all Master Data modules.
- **Frontend App**: React, TypeScript, Vite, Tailwind CSS scaffolding.
- **Dashboard UI**: Fully functional Dashboard Layout with navigation and routing.
- **Data Tables**: Interactive Master Data grids with add, edit, delete, and search functionality.
- **Database Seeding**: Scripts to populate mock data for Departments, Faculty, and Students.
- **GitHub Infrastructure**: Standardized `.gitignore`, `README.md`, `LICENSE`, `CONTRIBUTING.md`, and Issue Templates.
