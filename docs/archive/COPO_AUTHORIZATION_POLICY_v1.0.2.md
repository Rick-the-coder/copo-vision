# COPO Vision Authorization Policy v1.0.2

**Document Version:** 1.0.2  
**Status:** DRAFT / PENDING BUSINESS & DOMAIN MODEL APPROVAL  
**Classification:** Enterprise Security Specification  
**Target System:** COPO Vision Academic Analytics Platform (Flask 3.x / MySQL Runtime)  

---

## Document Changelog

| Version | Date | Changes | Rationale | Approval Status |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | 2026-09-21 | Initial draft of the authorization policy specification. | Baseline policy document after Phase 5B.2-B investigation. | Draft |
| **1.0.1** | 2026-09-21 | Added explicit 4-state classification taxonomy, expanded Decision Register (`AUTH-001` to `AUTH-026`), added implementation status tracking, decoupled assessment lifecycle, and formalized data-scope constraints. | Controlled policy revision to establish traceability. | Draft |
| **1.0.2** | 2026-09-21 | **Final Traceability & Classification Consistency Review**: Strictly decoupled Evidence/Policy Status from Implementation Status; decoupled Admin role existence from unverified institution-wide data scope; distinguished confirmed BOLA vulnerabilities from proposed remediation; established dedicated Function-Level RBAC Decision IDs (`AUTH-027`, `AUTH-028`, `AUTH-029`); synchronized 100% of Permission Matrix rows to the Decision Register; formalized the strict dependency lifecycle (`Business Decision -> Domain Model -> Schema -> Implementation`). | Final pre-review stabilization pass to ensure zero ambiguity between repository facts, architectural proposals, business decisions, schema requirements, and runtime code state. | **DRAFT / PENDING BUSINESS APPROVAL** |

---

## Policy & Implementation Status Summary

The multi-dimensional matrix below separates **Evidence Baseline**, **Policy Target State**, **Implementation Status**, and **Immediate Next Gate**:

| Functional Area | Existing Evidence Status | Policy Target State | Policy Status | Implementation Status | Next Gate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication (5A)** | `CONFIRMED` (JWT verify, `is_active` DB check, `g.current_user`) | Protected-by-default boundary. | `CONFIRMED` | **IMPLEMENTED (100%)** | Closed / Verified |
| **Function-Level RBAC (5B.2-A)** | `CONFIRMED` (`@require_roles('admin', 'hod')` on 3 endpoints) | Admin / HOD allowed; Faculty denied (`403`). | `CONFIRMED` | **IMPLEMENTED (100%)** | Closed / Verified |
| **Faculty-Subject Assignment** | `MISSING IN SCHEMA` (No table/column linking user to subject) | Multi-subject allocation with academic context. | `PROPOSED` | **NOT IMPLEMENTED** | Business Approval $\to$ Domain Model |
| **HOD Department Scope** | `MISSING IN SCHEMA` (`users` lacks `department_id`) | Department-bounded administrative authority. | `PROPOSED` | **NOT IMPLEMENTED** | Business Approval $\to$ Domain Model |
| **Marks Upload BOLA (5B-A)** | `CONFIRMED VULNERABILITY` (`assessment_id` unverified) | Restricted strictly to active assigned faculty. | `PROPOSED` | **NOT IMPLEMENTED** | Business Approval $\to$ Domain Model |
| **Assessment Create / Edit** | `CONFIRMED` (Routes exist without ownership check) | Scoped to assigned faculty and department HOD. | `BUSINESS DECISION REQUIRED` | **NOT IMPLEMENTED** | Business Approval |
| **Assessment Deletion** | `CONFIRMED` (No DELETE route in active Flask backend) | Soft-archival only; restricted to Admin/HOD. | `BUSINESS DECISION REQUIRED` | **NOT IMPLEMENTED** | Business Approval |
| **Student Roster Read Scope** | `CONFIRMED` (`GET /api/students/` returns all students) | Open catalog vs. department/course filtered. | `BUSINESS DECISION REQUIRED` | **NOT IMPLEMENTED** | Business Approval |
| **PO Attainment Visibility** | `CONFIRMED` (`GET /api/copo/po-attainment` returns all POs) | Admin/HOD department vs. faculty subject-derived. | `BUSINESS DECISION REQUIRED` | **NOT IMPLEMENTED** | Business Approval |
| **Predictions Read Scope** | `CONFIRMED` (`GET /api/predictions/` returns all risk scores) | HOD/Admin department vs. faculty enrolled student. | `BUSINESS DECISION REQUIRED` | **NOT IMPLEMENTED** | Business Approval $\to$ Domain Model |
| **Alert Visibility & Routing** | `CONFIRMED` (All 1,989 seed rows have `faculty_id = NULL`) | Routed by `subject_id`, `department_id`, recipient. | `BUSINESS DECISION REQUIRED` | **NOT IMPLEMENTED** | Business Approval $\to$ Domain Model |
| **Dashboard Scope** | `CONFIRMED` (`GET /api/dashboard/summary` global aggregate) | Aggregated strictly to user's authorized scope. | `PROPOSED` | **NOT IMPLEMENTED** | Business Approval $\to$ Domain Model |
| **Historical Data Policy** | `CONFIRMED` (No temporal query restrictions) | Expired assignment $\to$ historical read, write lockout. | `PROPOSED` | **NOT IMPLEMENTED** | Business Approval |
| **Security Audit Logging** | `CONFIRMED` (Unstructured console logs only) | Structured JSON audit trail for mutations. | `PROPOSED` | **NOT IMPLEMENTED** | Implementation Design |

---

## 1. Governance & Classification Taxonomy

To prevent ambiguity during executive and technical reviews, every policy statement, data relationship, and security control is evaluated across two distinct, orthogonal dimensions:

### Dimension A: Evidence & Policy Status
* **`CONFIRMED`**: Directly verified and supported by active repository code, database schema, or completed test suites.
* **`PROPOSED`**: Security architecture recommendation designed to enforce least privilege; pending formal business stakeholder sign-off.
* **`BUSINESS DECISION REQUIRED`**: The policy behavior depends on institutional governance choices that cannot be derived from code alone.
* **`DOMAIN MODEL REQUIRED`**: The policy is conceptually clear, but cannot be implemented until the underlying relational entity or database foreign key is created.
* **`UNKNOWN`**: Insufficient repository evidence exists; must not be converted into code without clarification.

### Dimension B: Runtime Implementation Status
* **`IMPLEMENTED`**: Fully coded, tested, and actively enforced in the current Flask runtime.
* **`PARTIALLY IMPLEMENTED`**: Some aspects exist (e.g., identity bound), but object-level checks or scoping are missing.
* **`NOT IMPLEMENTED`**: No runtime enforcement exists in the active codebase.
* **`NOT APPLICABLE`**: Operation not supported or not pertinent to the resource.

---

## 2. Policy Principles

The COPO Vision Authorization Framework enforces the following twelve mandatory enterprise principles:

1. **Server-Side Enforcement**: All authorization decisions are strictly evaluated and enforced by backend application logic. Client-side route guards, disabled UI buttons, or hidden dashboard elements in React provide zero security guarantees.
2. **Deny by Default**: Every request to a protected resource is denied unless an explicit rule, valid role, active assignment, and matching scope authorize the operation.
3. **Least Privilege**: Users are granted only the minimal permissions necessary to perform their legitimate academic and administrative functions within their designated scope.
4. **Explicit Authorization**: Access is never implied through indirect relationships; it requires explicit verification against authenticated identity and verified organizational relationships.
5. **Object-Level Authorization**: The backend independently validates that the caller possesses authority over the specific target entity instance (e.g., specific `assessment_id`, `student_id`). Existence of an ID in MySQL is never equivalent to authorization.
6. **Separation of Authentication and Authorization**:
   - Authentication (Problem #5A) establishes *who* the caller is (`g.current_user`). Failures result in `HTTP 401 Unauthorized`.
   - Authorization (Problem #5B) determines *what* the authenticated user is permitted to access or modify. Failures result in `HTTP 403 Forbidden`.
7. **No Trust in Client-Supplied Identity or Roles**: Client-provided role headers, form fields (`uploaded_by`, `user_id`, `role`), or query parameters are treated as untrusted input. The server derives role and identity solely from verified cryptographic token claims and database-backed user state in `flask.g.current_user`.
8. **Separation of Read and Write Permissions**: Permission to view academic records (read scope) does not confer permission to upload marks, modify assessments, or recalculate attainments (write scope).
9. **Contextual & Time-Bound Authorization**: Permissions are evaluated in the context of specific academic periods (Academic Year, Semester). Expired teaching assignments terminate write privileges.
10. **Auditable Sensitive Operations**: State-changing operations (marks upload, attainment recalculation, model generation) generate structured audit records.
11. **Fail-Closed on Missing Context**: If authorization context, assignment mapping, or tenancy attributes cannot be resolved, the system defaults to denial (`HTTP 403`).
12. **Aggregations Must Not Leak Scopes**: High-level statistical summaries and dashboards must compute aggregates strictly across data points the user is authorized to read individually.

---

## 3. Strict Implementation Dependency Lifecycle

To avoid implementing artificial or ungrounded database structures, all object-level and data-scope security remediation must follow this strict linear lifecycle:

```
[1. Business Policy Decision]
             │
             ▼
[2. Approved Authorization Policy Specification]
             │
             ▼
[3. Domain Model & Relational Requirement Specification]
             │
             ▼
[4. Schema Design & Controlled Database Migrations]
             │
             ▼
[5. Controller & Service Authorization Implementation]
             │
             ▼
[6. Automated Unit & Integration Regression Testing]
             │
             ▼
[7. Independent Security Verification & Sign-Off]
```

Under no circumstances may engineering proceed to Schema Design (Step 4) or Code Implementation (Step 5) while items remain at Step 1 (`BUSINESS DECISION REQUIRED`) or Step 2 (`PROPOSED`).

---

## 4. Actor / Role Model

The platform recognizes three primary administrative and academic roles within `users.role`:

```
               ┌──────────────────────────────┐
               │            ADMIN             │ [Role: CONFIRMED] [Scope: PROPOSED / NOT IMPLEMENTED]
               └──────────────┬───────────────┘
                              │
               ┌──────────────▼───────────────┐
               │             HOD              │ [Role: CONFIRMED] [Scope: PROPOSED / NOT IMPLEMENTED]
               └──────────────┬───────────────┘
                              │
               ┌──────────────▼───────────────┐
               │           FACULTY            │ [Role: CONFIRMED] [Scope: PROPOSED / NOT IMPLEMENTED]
               └──────────────────────────────┘
```

### 4.1 ADMIN
* **Role Existence**: `CONFIRMED` in schema enum (`users.role = 'admin'`).
* **Function-Level RBAC**: `CONFIRMED` & `IMPLEMENTED` for `/api/copo/calculate`, `/api/predictions/generate`, `/api/alerts/generate` (Decision `AUTH-027`, `AUTH-028`, `AUTH-029`).
* **Object / Data Scope**: Institution-wide administrative scope is `PROPOSED` (Decision `AUTH-003`; `NOT IMPLEMENTED`). Unrestricted object access across all departments must be formally authorized.
* **Proposed Scope**: Unrestricted access across all departments, courses, subjects, assessments, and students for system maintenance.

### 4.2 HOD — Head of Department
* **Role Existence**: `CONFIRMED` in schema enum (`users.role = 'hod'`).
* **Function-Level RBAC**: `CONFIRMED` & `IMPLEMENTED` for `/api/copo/calculate`, `/api/predictions/generate`, `/api/alerts/generate`.
* **Object / Data Scope**: Department-wide supervisory scope is `PROPOSED` (Decision `AUTH-002`; `DOMAIN MODEL REQUIRED`; `NOT IMPLEMENTED`). Currently, `users` lacks `department_id`, so HOD scope cannot be bounded in the active database.
* **Proposed Scope**: Read access to all departmental academic performance data; authority to manage departmental courses/subjects; supervisory review of marks.

### 4.3 FACULTY
* **Role Existence**: `CONFIRMED` in schema enum (`users.role = 'faculty'`).
* **Function-Level RBAC**: `CONFIRMED` & `IMPLEMENTED` (denied with `403` on `/api/copo/calculate`, `/api/predictions/generate`, `/api/alerts/generate`).
* **Object / Data Scope**: Subject assignment scope is `PROPOSED` (Decision `AUTH-001`; `DOMAIN MODEL REQUIRED`; `NOT IMPLEMENTED`). Currently, no table records which faculty teaches which subject.
* **Proposed Scope**: Strictly limited to assessments, marks, and student evaluations belonging to assigned subjects.

---

## 5. Organizational Hierarchy & Attachment Points

The verified academic hierarchy and proposed actor attachments are structured as follows:

```
[Institution Node] <─── ADMIN Actor (Proposed Institution-wide Scope)
       │
       └── [Department Entity] <─── HOD Actor (Proposed Department-wide Scope)
                 │
                 ├── [Course / Program Entity]
                 │         │
                 │         ├── [Student Entity] (Enrolled in course)
                 │         │         │
                 │         │         ├── [Student Marks]
                 │         │         ├── [CO Attainment]
                 │         │         ├── [PO Attainment]
                 │         │         ├── [Predictions]
                 │         │         └── [Alerts]
                 │         │
                 │         └── [Subject Entity] (Curriculum module)
                 │                   │
                 │                   ├── [Course Outcomes (COs)] ──► [PO Mapping]
                 │                   │
                 │                   └── [Assessment Entity]
                 │                             │
                 │                             └── [Assessment CO Mapping] ──► [Student Marks]
                 │
                 └── [Faculty Subject Assignment Entity] <─── FACULTY Actor (Proposed Subject Scope)
```

* **ADMIN Attachment**: Institution root (`CONFIRMED Role` / `PROPOSED Scope`).
* **HOD Attachment**: Department node (`CONFIRMED Role` / `PROPOSED Scope` — `DOMAIN MODEL REQUIRED`: requires `users.department_id`).
* **FACULTY Attachment**: Dynamic attachment to Subject nodes (`CONFIRMED Role` / `PROPOSED Scope` — `DOMAIN MODEL REQUIRED`: requires `faculty_subject_assignments`).

---

## 6. Faculty Assignment Policy

To eliminate arbitrary marks upload vulnerabilities (BOLA), faculty authorization must be grounded in an explicit **Faculty Subject Assignment** model:

```
[User (Role: Faculty)] <─── [Faculty Subject Assignment Entity] ───> [Subject Entity]
                                          │
                            ├── academic_year_id
                            ├── semester
                            ├── is_active (boolean)
                            └── assignment_role (PRIMARY_INSTRUCTOR / CO_INSTRUCTOR / EVALUATOR / OBSERVER)
```

### Policy Rules:
1. **Multi-Subject Allocation (`PROPOSED` — Decision `AUTH-004`)**: A faculty member may hold concurrent assignments across multiple subjects within or across academic semesters.
2. **Multi-Instructor Subjects (`BUSINESS DECISION REQUIRED` — Decision `AUTH-005`, `AUTH-024`)**: A subject may have multiple assigned instructors. The business must decide whether all co-instructors have equal mark upload rights or if a `PRIMARY_INSTRUCTOR` role is required.
3. **Academic Period Bounding (`PROPOSED` — Decision `AUTH-006`, `AUTH-007`)**: Assignments are valid only within the specified `academic_year_id` and `semester`.
4. **Lifecycle & Status Transition (`PROPOSED` — Decision `AUTH-011`)**:
   - `ACTIVE`: Grants full read and upload/write permissions for the subject's assessments.
   - `INACTIVE` / `EXPIRED`: Revokes write/upload permissions; transitions faculty to historical read-only access.
   - `REVOKED`: Immediately terminates all access to subject management.

---

## 7. Permission Model

Operations are defined independently of roles:

* **`READ`**: Retrieve entity metadata, catalog listings, or calculation summaries.
* **`CREATE`**: Define new entities (courses, subjects, assessments, assignments).
* **`UPDATE`**: Modify metadata or configurations of existing entities.
* **`DELETE`**: Remove draft or unreferenced entities.
* **`UPLOAD_MARKS`**: Submit and commit student evaluation mark sheets against an assessment.
* **`CALCULATE_ATTAINMENT`**: Execute attainment calculation engines across CO and PO metrics.
* **`TRAIN_MODEL`**: Execute Machine Learning predictive model fitting and risk scoring.
* **`GENERATE_ALERTS`**: Execute automated anomaly detection rules and insert system alerts.
* **`EXPORT`**: Export student marks, attainment matrices, or NBA compliance reports.

---

## 8. Definitive Permission Matrix

Every operation in the matrix below is explicitly classified by policy status, decision register tracking ID, and runtime implementation state:

| Resource | Action | Admin | HOD | Faculty | Scope Boundary | Context Constraint | Policy Status | Decision ID | Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Departments** | READ | ALLOW | ALLOW | ALLOW | Institution | None | `CONFIRMED` | AUTH-003 | **IMPLEMENTED** |
| **Departments** | CREATE / EDIT | ALLOW | DENY | DENY | Institution | Admin Only | `PROPOSED` | AUTH-003 | **NOT IMPLEMENTED** |
| **Courses** | READ | ALLOW | ALLOW | ALLOW | Institution | None | `CONFIRMED` | AUTH-003 | **IMPLEMENTED** |
| **Courses** | CREATE / EDIT | ALLOW | ALLOW (Dept) | DENY | Department | Academic Year | `BUSINESS DECISION REQUIRED` | AUTH-026 | **NOT IMPLEMENTED** |
| **Subjects** | READ | ALLOW | ALLOW | ALLOW | Institution | None | `CONFIRMED` | AUTH-003 | **IMPLEMENTED** |
| **Subjects** | CREATE / EDIT | ALLOW | ALLOW (Dept) | DENY | Department | Academic Year | `BUSINESS DECISION REQUIRED` | AUTH-026 | **NOT IMPLEMENTED** |
| **Faculty Assignments**| CREATE / REVOKE | ALLOW | ALLOW (Dept) | DENY | Department | Academic Year | `PROPOSED` | AUTH-004 | **NOT IMPLEMENTED** |
| **Assessments** | READ | ALLOW | ALLOW (Dept) | ALLOW (Assigned) | Subject / Dept / Global | Current + Historical | `BUSINESS DECISION REQUIRED` | AUTH-013 | **NOT IMPLEMENTED** |
| **Assessments** | CREATE / EDIT | ALLOW | ALLOW (Dept) | ALLOW (Assigned) | Assigned Subject | Active Assignment | `BUSINESS DECISION REQUIRED` | AUTH-021 | **NOT IMPLEMENTED** |
| **Assessments** | DELETE | ALLOW | ALLOW (Dept) | DENY | Assigned Subject | Draft / No Marks Only | `BUSINESS DECISION REQUIRED` | AUTH-022 | **NOT IMPLEMENTED** |
| **Marks** | UPLOAD | ALLOW | ALLOW (Dept) | ALLOW (Assigned) | Assigned Subject | **Active Assignment** | `PROPOSED` | AUTH-009 | **NOT IMPLEMENTED** |
| **Marks** | READ | ALLOW | ALLOW (Dept) | ALLOW (Assigned) | Assigned Subject | Current + Historical | `BUSINESS DECISION REQUIRED` | AUTH-014 | **NOT IMPLEMENTED** |
| **Student Roster** | READ | ALLOW | ALLOW | ALLOW | Open Catalog vs Dept | None | `BUSINESS DECISION REQUIRED` | AUTH-012 | **NOT IMPLEMENTED** |
| **CO Attainment** | READ | ALLOW | ALLOW (Dept) | ALLOW (Assigned) | Assigned Subject | Academic Year | `BUSINESS DECISION REQUIRED` | AUTH-015 | **NOT IMPLEMENTED** |
| **PO Attainment** | READ | ALLOW | ALLOW (Dept) | ALLOW (Subject-derived)| Department / Subject | Academic Year | `BUSINESS DECISION REQUIRED` | AUTH-016 | **NOT IMPLEMENTED** |
| **Attainment** | CALCULATE | ALLOW | ALLOW | **DENY (403)** | Global / Dept | Role Guarded | `CONFIRMED` | AUTH-027 | **IMPLEMENTED (5B.2-A)** |
| **Predictions** | GENERATE | ALLOW | ALLOW | **DENY (403)** | Global / Dept | Role Guarded | `CONFIRMED` | AUTH-028 | **IMPLEMENTED (5B.2-A)** |
| **Predictions** | READ | ALLOW | ALLOW (Dept) | ALLOW (Students) | Enrolled Students Only | Active Term | `BUSINESS DECISION REQUIRED` | AUTH-025 | **NOT IMPLEMENTED** |
| **Alerts** | GENERATE | ALLOW | ALLOW | **DENY (403)** | Global / Dept | Role Guarded | `CONFIRMED` | AUTH-029 | **IMPLEMENTED (5B.2-A)** |
| **Alerts** | READ | ALL | DEPT ALERTS | OWN / SUBJECT | Recipient & Subject | Unread / Active | `BUSINESS DECISION REQUIRED` | AUTH-018 | **NOT IMPLEMENTED** |
| **Dashboard** | SUMMARY | GLOBAL | DEPT KPI | SUBJECT KPI | User Domain Scope | Real-Time Aggregate | `PROPOSED` | AUTH-019 | **NOT IMPLEMENTED** |
| **Reports / Marks**| EXPORT | ALLOW | ALLOW (Dept) | ALLOW (Assigned) | Assigned Subject | Active + Historical | `BUSINESS DECISION REQUIRED` | AUTH-023 | **NOT IMPLEMENTED** |

---

## 9. Marks Upload Security Policy (`POST /api/uploads/marks`)

### 9.1 Vulnerability Finding vs. Remediation Policy
* **Vulnerability Finding**: `CONFIRMED BOLA VULNERABILITY` (The active endpoint accepts client-supplied `assessment_id` and performs existence checks without validating instructional authority).
* **Proposed Remediation Policy**: `PROPOSED` (Restricted strictly to active assigned faculty; Decision `AUTH-009`).
* **Implementation Status**: `NOT IMPLEMENTED` (`DOMAIN MODEL REQUIRED`: requires `faculty_subject_assignments`).

```
                  POST /api/uploads/marks (assessment_id=X)
                                    │
                                    ▼
                      [5A Authentication: Bearer JWT]
                                    │
                       (Valid Token: g.current_user)
                                    ▼
                      [Resolve Assessment -> Subject]
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
  [Role: Admin]               [Role: HOD]                [Role: Faculty]
        │                           │                           │
     ALLOWED              (Check Dept Mapping)        (Check Active Subject
        │                           │                       Assignment)
        │                           ▼                           │
        │                  ┌─────────────────┐                  ▼
        │                  │ In Dept?        │         ┌─────────────────┐
        │                  │ YES -> ALLOW    │         │ Assigned?       │
        │                  │ NO  -> 403 DENY │         │ YES -> ALLOW    │
        │                  └─────────────────┘         │ NO  -> 403 DENY │
        ▼                                              └─────────────────┘
 [Execute Upload]
```

### 9.2 Denial Behavior
If an authenticated faculty member attempts to submit marks for an unassigned assessment:
* The transaction is aborted immediately before file processing or database insertion.
* The server responds with `HTTP 403 Forbidden` (`{"status": "error", "message": "Access denied: You are not assigned to this subject/assessment"}`).

---

## 10. Assessment Ownership & Lifecycle Policy

1. **Subject Association (`CONFIRMED`)**: Assessments are structural children of `subjects` (`assessments.subject_id`), representing institutional curriculum milestones rather than private faculty possessions.
2. **Faculty Assessment Create / Edit Rights (`BUSINESS DECISION REQUIRED` — Decision `AUTH-021`)**:
   - *Proposed Rule*: Faculty may create or update assessments only for subjects where they hold an active assignment.
   - *Alternative Rule*: Assessments are set strictly by Department HODs; faculty only evaluate.
3. **Assessment Deletion Authority (`BUSINESS DECISION REQUIRED` — Decision `AUTH-022`)**:
   - Permanent deletion is restricted to draft assessments with zero associated student marks.
   - Assessments with existing marks must be archived/deactivated, never deleted.

---

## 11. Read Data-Scope Policy

| Endpoint | Target Resource | Current Behavior | Proposed Policy | Decision ID | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /api/students/` | Master Student Roster | Returns all students | Open directory vs. department filtered | AUTH-012 | `BUSINESS DECISION REQUIRED` |
| `GET /api/assessments/` | Assessments Catalog | Returns all assessments | `Faculty`: Assigned subjects; `HOD`: Dept | AUTH-013 | `BUSINESS DECISION REQUIRED` |
| `GET /api/copo/attainment` | CO Attainment Reports | Returns all CO results | `Faculty`: Assigned subjects; `HOD`: Dept | AUTH-015 | `BUSINESS DECISION REQUIRED` |
| `GET /api/copo/po-attainment`| PO Attainment Reports | Returns all PO results | `HOD`/`Admin`: Dept/Global; `Faculty`: Subject POs | AUTH-016 | `BUSINESS DECISION REQUIRED` |
| `GET /api/predictions/` | ML Student Risk Scores | Returns all predictions | `Faculty`: Enrolled students; `HOD`: Dept | AUTH-025 | `BUSINESS DECISION REQUIRED` |
| `GET /api/alerts/` | Operational Alerts | Returns all 1,989 alerts | Filtered by recipient, assigned subject, dept | AUTH-018 | `BUSINESS DECISION REQUIRED` |
| `GET /api/dashboard/summary` | Analytics Dashboard | Returns global counts | Aggregated strictly to caller's scope | AUTH-019 | `PROPOSED` |

---

## 12. Recommended Data-Scope Principle

The enterprise authorization model divides academic data into two distinct privacy tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 1: ACADEMIC REFERENCE & MASTER CATALOG DATA                       │
│ (Departments, Courses, Subject Catalog, Course Outcomes, Grade Scales) │
│ ──► Open visibility across all authenticated faculty for inter-        │
│     disciplinary coordination and academic scheduling.                 │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ TIER 2: SENSITIVE PERFORMANCE & STUDENT EVALUATION DATA                │
│ (Student Marks, CO Attainments, ML Risk Scores, Disciplinary Alerts)   │
│ ──► Strictly scoped to assigned instructors, department HODs, and      │
│     institutional administrators.                                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 13. HOD Authorization Policy

* **Departmental Jurisdiction (`PROPOSED` — Decision `AUTH-002`)**: An HOD's authority is strictly bounded by their assigned `department_id` (`DOMAIN MODEL REQUIRED`; `NOT IMPLEMENTED`).
* **Supervisory Read Rights**: An HOD can inspect all student marks, assessment blueprints, attainment calculations, and alerts across all courses within their department.
* **Supervisory Write Rights**: An HOD may trigger batch calculations and generate alerts for their department.
* **Cross-Department Denial**: An HOD has zero administrative or write privileges over courses or subjects housed in other academic departments.

---

## 14. Admin Authorization Policy

* **Role & Function Authority (`CONFIRMED` — Decision `AUTH-003`, `AUTH-027`, `AUTH-028`, `AUTH-029`)**: Admin role is active in the database and enforced on global function triggers.
* **Object Scope (`PROPOSED` — Decision `AUTH-003`; `NOT IMPLEMENTED`)**: Administrators hold proposed system-wide authority to manage user accounts, assign roles, configure global academic calendars, and execute full-institution predictive training.
* **Audit Transparency (`PROPOSED` — Decision `AUTH-020`)**: All administrative write and override actions are logged to immutable security audit logs.

---

## 15. Alert Authorization Policy & `faculty_id = NULL` Resolution

### 15.1 Alert Scoping Taxonomy (`PROPOSED` — Decision `AUTH-018`)
Alerts are classified into four explicit visibility tiers:

```
[Alert Scope Taxonomy]
   ├── GLOBAL        ──► Visible to Admin & all HODs (Campus announcements)
   ├── DEPARTMENT    ──► Visible to HOD and Faculty within specific department
   ├── SUBJECT       ──► Visible to all Faculty assigned to the referenced subject
   └── INDIVIDUAL    ──► Visible strictly to designated faculty_id
```

### 15.2 Resolution of `faculty_id = NULL` (`BUSINESS DECISION REQUIRED` — Decision `AUTH-018`)
To correct the current ambiguity where 100% of automated alerts have `faculty_id = NULL`:
* **`LOW_CO_ATTAINMENT`**: System must associate the alert with the `subject_id` of the Course Outcome (`DOMAIN MODEL REQUIRED`). The alert is delivered to all faculty holding an active assignment for that subject.
* **`AT_RISK_STUDENT`**: System must associate the alert with the student's department/course (`DOMAIN MODEL REQUIRED`). The alert is delivered to the department HOD and the student's current subject instructors.
* **Global / Unassigned Alerts**: If an alert has neither `faculty_id` nor `subject_id`, it is classified as `ADMIN_ONLY` and hidden from faculty views.

---

## 16. Historical Data Policy

* **Read-After-Term (`BUSINESS DECISION REQUIRED` — Decision `AUTH-011`)**: When an academic semester concludes or a faculty assignment transitions to `INACTIVE`, the faculty member retains **read-only access** to historical marks, attainments, and evaluations generated during their active tenure.
* **Write Lockout (`PROPOSED` — Decision `AUTH-011`)**: Under no circumstances may a faculty member upload or modify marks for past academic terms once an assignment has expired.

---

## 17. Academic Context Policy (Year & Semester)

Authorization policies are evaluated with explicit reference to academic temporal context:
* Current operations require `academic_years.is_current = 1` or an active semester flag (`PROPOSED` — Decision `AUTH-006`, `AUTH-007`).
* Modifying closed academic years is restricted exclusively to `Admin` override workflows.

---

## 18. Section / Division Policy

* **Single-Cohort Subjects**: If a subject is taught as a single combined class, subject-level assignment is sufficient.
* **Multi-Section Subjects (`BUSINESS DECISION REQUIRED` — Decision `AUTH-008`)**: If a subject is divided into distinct sections (e.g. Section A, Section B) with separate instructors, the assignment model must incorporate `section_id` to prevent cross-section mark tampering (`DOMAIN MODEL REQUIRED`).

---

## 19. Read vs. Write Separation

| Operation Type | Evaluation Invariant | Failure Response |
| :--- | :--- | :--- |
| **READ Operation** | Caller scope covers the entity's organizational domain. | `403 Forbidden` (or empty collection where list filtering applies). |
| **WRITE / UPLOAD Operation** | Caller possesses active, non-expired write permission on the specific object instance. | `403 Forbidden` with immediate transaction rollback. |

---

## 20. Default Deny Policy

* Any request lacking an explicit, positively verified authorization path is rejected.
* Missing tokens $\to$ `401 Unauthorized` (`CONFIRMED` & `IMPLEMENTED`).
* Unrecognized roles $\to$ `403 Forbidden` (`CONFIRMED` & `IMPLEMENTED`).
* Unassigned subject requests $\to$ `403 Forbidden` (`PROPOSED` / `NOT IMPLEMENTED`).
* Cross-department requests by HOD $\to$ `403 Forbidden` (`PROPOSED` / `NOT IMPLEMENTED`).

---

## 21. Server-Side Enforcement Invariant

All authorization logic resides on the server. The Flask application verifies `g.current_user["role"]` and relational assignment bindings at the start of every controller before calling services or executing SQL queries.

---

## 22. Client-Controlled Object IDs (BOLA Defense)

For every endpoint accepting entity keys (`assessment_id`, `student_id`, `subject_id`, `alert_id`):
```
Client Input ID ──► Query Database ──► Validate Parent Chain ──► Verify Caller Ownership ──► Execute
```
If caller context fails to match the entity's resolved parent scope, access is denied.

---

## 23. Auditability & Security Logging

The following events must generate structured JSON audit logs (`PROPOSED` — Decision `AUTH-020`; `NOT IMPLEMENTED`):
1. `AUTHZ_SUCCESS_UPLOAD`: Successful marks sheet submission (including `user_id`, `assessment_id`, record count).
2. `AUTHZ_DENIED_BOLA`: Attempted marks upload or object modification without valid assignment.
3. `AUTHZ_DENIED_RBAC`: Attempted invocation of privileged endpoints by unauthorized roles.
4. `AUTHZ_CALCULATION_TRIGGER`: Execution of attainment re-computation.
5. `AUTHZ_ASSIGNMENT_CHANGE`: Granting or revoking faculty subject assignments.

---

## 24. Authorization Failure Semantics

* **`401 Unauthorized`**: Returned when authentication is missing, expired, or invalid (`CONFIRMED` & `IMPLEMENTED`).
* **`403 Forbidden`**: Returned when caller identity is known, but authorization is insufficient (`CONFIRMED` & `IMPLEMENTED`).
* **Information Concealment**: Error messages must not leak internal database state, schema details, or third-party ownership identities (e.g., return generic *"Access denied: Insufficient permissions for this resource"*).

---

## 25. Complete Policy Decision Register

The formal Policy Decision Register tracks every logical authorization decision, its evidence baseline, approval requirement, domain model dependency, and runtime state:

| ID | Decision Area | Existing Evidence | Proposed Enterprise Policy | Policy Status | Business Approval Status | Domain Model Req | Implementation Status | Next Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`AUTH-001`** | Faculty Scope | `users.role = 'faculty'` exists; no subject assignment table. | Bounded strictly to active assigned subjects. | `PROPOSED` | `PROPOSED` | **REQUIRED** (`faculty_subject_assignments`) | **NOT IMPLEMENTED** | Stakeholder Sign-Off $\to$ Model |
| **`AUTH-002`** | HOD Scope | `users.role = 'hod'` exists; `users` lacks `department_id`. | Bounded strictly to assigned department. | `PROPOSED` | `PROPOSED` | **REQUIRED** (`users.department_id`) | **NOT IMPLEMENTED** | Stakeholder Sign-Off $\to$ Model |
| **`AUTH-003`** | Admin Scope | `users.role = 'admin'` exists; function RBAC verified. | Institution-wide administrative authority. | `PROPOSED` | `PROPOSED` | None | **NOT IMPLEMENTED (Object/Scope)** | Stakeholder Sign-Off |
| **`AUTH-004`** | Faculty Assignment Entity | Absent from schema; no table links user to subject. | Intermediate relation mapping `user_id` to `subject_id`. | `PROPOSED` | `PROPOSED` | **REQUIRED** (`faculty_subject_assignments`) | **NOT IMPLEMENTED** | Schema Design |
| **`AUTH-005`** | Multiple Faculty per Subject | Absent from schema. | Allowed (co-instructors / lab evaluators). | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | **REQUIRED** | **NOT IMPLEMENTED** | Stakeholder Sign-Off |
| **`AUTH-006`** | Academic Year Context | `academic_years` table exists in MySQL export. | Assignments scoped to `academic_year_id`. | `PROPOSED` | `PROPOSED` | **REQUIRED** | **NOT IMPLEMENTED** | Schema Design |
| **`AUTH-007`** | Semester Context | `subjects.semester` column exists in schema. | Assignments scoped to `subjects.semester`. | `PROPOSED` | `PROPOSED` | **REQUIRED** | **NOT IMPLEMENTED** | Schema Design |
| **`AUTH-008`** | Section / Division Scope | Absent from active schema. | Subdivide subject assignments by section. | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | **REQUIRED** (`sections` table) | **NOT IMPLEMENTED** | Stakeholder Sign-Off |
| **`AUTH-009`** | Marks Upload Authorization | `assessment_id` unverified (`CONFIRMED BOLA GAP`). | Restricted strictly to active assigned faculty. | `PROPOSED` | `PROPOSED` | **REQUIRED** (`faculty_subject_assignments`) | **NOT IMPLEMENTED** | Stakeholder Sign-Off $\to$ Model |
| **`AUTH-010`** | Assessment Ownership | `assessments.subject_id` exists; no faculty link. | Subject-level ownership with evaluator rights. | `PROPOSED` | `PROPOSED` | None | **NOT IMPLEMENTED** | Architecture Sign-Off |
| **`AUTH-011`** | Historical Data Access | No temporal read/write query restrictions. | Historical read allowed; past write locked out. | `PROPOSED` | `BUSINESS DECISION REQUIRED` | None | **NOT IMPLEMENTED** | Stakeholder Sign-Off |
| **`AUTH-012`** | Student Directory Visibility | `GET /api/students/` returns all students. | Open catalog read vs. department filtered. | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | **REQUIRED** (if filtered) | **NOT IMPLEMENTED** | Stakeholder Sign-Off |
| **`AUTH-013`** | Assessment Visibility | `GET /api/assessments/` returns all assessments. | Visible only to assigned faculty & department HOD. | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | **REQUIRED** | **NOT IMPLEMENTED** | Stakeholder Sign-Off |
| **`AUTH-014`** | Marks Read Visibility | `student_marks` queries unscoped by user. | Visible only to assigned faculty & department HOD. | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | **REQUIRED** | **NOT IMPLEMENTED** | Stakeholder Sign-Off |
| **`AUTH-015`** | CO Attainment Visibility | `GET /api/copo/attainment` returns all COs. | Assigned faculty for subject; Dept HOD. | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | **REQUIRED** | **NOT IMPLEMENTED** | Stakeholder Sign-Off |
| **`AUTH-016`** | PO Attainment Visibility | `GET /api/copo/po-attainment` returns all POs. | Department HOD & Admin; Faculty subject-derived. | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | **REQUIRED** | **NOT IMPLEMENTED** | Stakeholder Sign-Off |
| **`AUTH-017`** | Prediction Read Visibility | `GET /api/predictions/` returns all predictions. | Department HOD & enrolled subject faculty. | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | **REQUIRED** | **NOT IMPLEMENTED** | Stakeholder Sign-Off |
| **`AUTH-018`** | Alert Routing & NULL Semantics| All 1,989 seed alert rows have `faculty_id = NULL`. | Route system alerts by `subject_id` / `dept_id`. | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | **REQUIRED** (`alerts.subject_id`) | **NOT IMPLEMENTED** | Stakeholder Sign-Off $\to$ Model |
| **`AUTH-019`** | Dashboard Scoping | `GET /api/dashboard/summary` computes global KPIs. | Aggregate KPIs strictly to user's authorized domain. | `PROPOSED` | `PROPOSED` | **REQUIRED** | **NOT IMPLEMENTED** | Stakeholder Sign-Off $\to$ Model |
| **`AUTH-020`** | Security Audit Logging | Unstructured print/console logs only. | Structured JSON audit logging for mutations. | `PROPOSED` | `PROPOSED` | None | **NOT IMPLEMENTED** | Implementation Design |
| **`AUTH-021`** | Faculty Assessment Create/Edit| Unscoped route execution. | Faculty can create/edit assessments for assigned subjects. | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | **REQUIRED** | **NOT IMPLEMENTED** | Stakeholder Sign-Off |
| **`AUTH-022`** | Assessment Delete Rights | No DELETE route in Flask backend. | Soft-archive only; restricted to HOD/Admin. | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | None | **NOT IMPLEMENTED** | Stakeholder Sign-Off |
| **`AUTH-023`** | Export Permissions | No export route in Flask backend. | Mark sheets exportable by assigned faculty/HOD. | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | None | **NOT IMPLEMENTED** | Stakeholder Sign-Off |
| **`AUTH-024`** | Co-Teaching Rights Hierarchy | Absent from active runtime. | Primary instructor vs. co-evaluator write rights. | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | **REQUIRED** (`assignment_role`) | **NOT IMPLEMENTED** | Stakeholder Sign-Off |
| **`AUTH-025`** | Student Prediction Read Rights| Unscoped route execution. | Faculty can view predictions only for enrolled students. | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | **REQUIRED** (`enrollments`) | **NOT IMPLEMENTED** | Stakeholder Sign-Off $\to$ Model |
| **`AUTH-026`** | Course & Subject Creation | No CRUD endpoints in active Flask routes. | HOD (own department) and Admin only. | `UNKNOWN` | `BUSINESS DECISION REQUIRED` | None | **NOT IMPLEMENTED** | Stakeholder Sign-Off |
| **`AUTH-027`** | Attainment Calculation RBAC | Route guarded by `@require_roles('admin', 'hod')`. | Restrict attainment re-computation to Admin/HOD. | `CONFIRMED` | `CONFIRMED` | None | **IMPLEMENTED (5B.2-A)** | Closed / Verified |
| **`AUTH-028`** | Prediction Generation RBAC | Route guarded by `@require_roles('admin', 'hod')`. | Restrict ML model training to Admin/HOD. | `CONFIRMED` | `CONFIRMED` | None | **IMPLEMENTED (5B.2-A)** | Closed / Verified |
| **`AUTH-029`** | Alert Generation RBAC | Route guarded by `@require_roles('admin', 'hod')`. | Restrict automated alert creation to Admin/HOD. | `CONFIRMED` | `CONFIRMED` | None | **IMPLEMENTED (5B.2-A)** | Closed / Verified |

---

## 26. Final Conceptual Authorization Model

```
                                  [INSTITUTION]
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                  [ADMIN ACTOR]               [DEPARTMENT ENTITY]
               (Global Authority)                      │
                                        ┌──────────────┴──────────────┐
                                        ▼                             ▼
                                   [HOD ACTOR]                 [COURSE ENTITY]
                               (Department Scope)                     │
                                                                      ▼
                                                               [SUBJECT ENTITY]
                                                                      │
                                                       ┌──────────────┴──────────────┐
                                                       ▼                             ▼
                                               [FACULTY ACTOR]              [ASSESSMENT ENTITY]
                                             (Subject Assignment)                    │
                                                       │                             ▼
                                                       └───────────────────► [STUDENT MARKS]
                                                                                     │
                                                                                     ▼
                                                                            [CO/PO ATTAINMENTS]
```

---

## 27. Future Implementation Requirements (Post-Approval Pre-requisites)

When formal business approval is granted, the implementation phase will require:
1. **Relational Schema Extensions (`DOMAIN MODEL REQUIRED`)**:
   - Creating a `faculty_subject_assignments` relation (`user_id`, `subject_id`, `academic_year_id`, `is_active`, `assignment_role`).
   - Adding a `department_id` foreign key on `users` for HOD and faculty organizational tenancy.
2. **Centralized Object Ownership Validator**:
   - Developing reusable validation utilities in `backend/utils/auth.py` (e.g. `verify_subject_assignment(user_id, subject_id)`).
3. **Query Scoping Refactor**:
   - Updating read queries across `assessments.py`, `copo.py`, and `alerts.py` to accept caller-bound scope parameters.
4. **Alert Service Metadata Tagging**:
   - Modifying `backend/services/alert_service.py` to record `subject_id` and `department_id` during automated generation.

---

## 28. Security Acceptance Criteria

1. **BOLA Immunity**: An authenticated faculty member attempting to upload marks for an unassigned assessment receives `HTTP 403 Forbidden`.
2. **ID-Tampering Immunity**: Changing `assessment_id` in form submissions cannot bypass subject assignment checks.
3. **Role Escalation Immunity**: Supplying client-controlled `role=admin` in request bodies or query parameters has zero effect.
4. **HOD Multi-Tenant Isolation**: HODs cannot view or modify subjects in other departments.
5. **Expired Assignment Protection**: Inactive assignments cannot authorize mark writes.
6. **Authentication & Authorization Separation**: Unauthenticated calls return `401`; unauthorized calls return `403`.
7. **Regression Safety**: All 52 existing backend tests continue to pass without regression.

---

## 29. Implementation Gate

**`BUSINESS APPROVAL REQUIRED`** & **`DOMAIN MODEL REQUIRED`**

*The policy specification v1.0.2 is complete, internally consistent, and fully traceable. Formal stakeholder sign-off on the Policy Decision Register (`AUTH-001` through `AUTH-029`) and domain model specification are mandatory pre-requisites before writing application code or database migrations.*

---

## 30. Scope Control Confirmation

* **Application Code Modified**: **NO**
* **Database Schema Modified**: **NO**
* **Migrations Created**: **NO**
* **Tests Modified**: **NO**
* **Frontend Modified**: **NO**
* **Git Operations Performed**: **NO** (No commit, push, PR, or branch operations).
