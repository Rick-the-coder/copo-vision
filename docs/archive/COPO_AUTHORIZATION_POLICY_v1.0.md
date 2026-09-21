# COPO Vision Authorization Policy v1.0

**Document Version:** 1.0.0  
**Status:** DRAFT / PENDING BUSINESS APPROVAL  
**Classification:** Enterprise Security Specification  
**Target System:** COPO Vision Academic Analytics Platform (Flask 3.x / MySQL Runtime)  

---

## 1. Policy Principles

The COPO Vision Authorization Framework enforces the following mandatory enterprise principles:

1. **Server-Side Enforcement**: All authorization decisions are strictly evaluated and enforced by backend application logic. Client-side route guards, disabled UI buttons, or hidden dashboard elements in React provide zero security guarantees.
2. **Deny by Default**: Every request to a protected resource is denied unless an explicit rule, valid role, active assignment, and matching scope authorize the operation.
3. **Least Privilege**: Users are granted only the minimal permissions necessary to perform their legitimate academic and administrative functions within their designated scope.
4. **Explicit Authorization**: Access is never implied through indirect relationships; it requires explicit verification against authenticated identity and verified organizational relationships.
5. **Object-Level Authorization**: The backend independently validates that the caller possesses authority over the specific target entity instance (e.g., specific `assessment_id`, `student_id`). Existence of an ID in MySQL is never equivalent to authorization.
6. **Separation of Authentication and Authorization**:
   - Authentication (Problem #5A) determines *who* the caller is (`g.current_user`). Failures result in `HTTP 401 Unauthorized`.
   - Authorization (Problem #5B) determines *what* the authenticated user is permitted to access/modify. Failures result in `HTTP 403 Forbidden`.
7. **No Trust in Client-Supplied Identity or Roles**: Client-provided role headers, form fields (`uploaded_by`, `user_id`, `role`), or query parameters are treated as untrusted input. The server derives role and identity solely from verified cryptographic token claims and database-backed user state in `flask.g.current_user`.
8. **Separation of Read and Write Permissions**: Permission to view academic records (read scope) does not confer permission to upload marks, modify assessments, or recalculate attainments (write scope).
9. **Contextual & Time-Bound Authorization**: Permissions are evaluated in the context of specific academic periods (Academic Year, Semester). Expired teaching assignments terminate write privileges.
10. **Auditable Sensitive Operations**: State-changing operations (marks upload, attainment recalculation, model generation) generate structured audit records.
11. **Fail-Closed on Missing Context**: If authorization context, assignment mapping, or tenancy attributes cannot be resolved, the system defaults to denial (`HTTP 403`).

---

## 2. Actor / Role Model

The platform recognizes three primary administrative and academic roles within `users.role`:

```
               ┌──────────────────────────────┐
               │            ADMIN             │ (Institution Scope)
               └──────────────┬───────────────┘
                              │
               ┌──────────────▼───────────────┐
               │             HOD              │ (Department Scope)
               └──────────────┬───────────────┘
                              │
               ┌──────────────▼───────────────┐
               │           FACULTY            │ (Assigned Subject Scope)
               └──────────────────────────────┘
```

### 2.1 ADMIN
* **Role Purpose**: System administrator responsible for institutional configuration, user management, academic structure maintenance, and execution of global computational jobs.
* **Organizational Scope**: Institution-Wide.
* **Default Permissions**: Full administrative control over metadata, master catalogs, model training, and attainment generation.
* **Object Scope**: Unrestricted access across all departments, courses, subjects, assessments, and students.
* **Data Scope**: Campus-wide analytics and audit logs.

### 2.2 HOD (Head of Department)
* **Role Purpose**: Academic supervisor responsible for overseeing curriculum execution, faculty assignments, student outcomes, and NBA accreditation reporting within a department.
* **Organizational Scope**: Department-Wide (*Proposed Policy — Policy Decision Required*).
* **Default Permissions**: Read access to all departmental academic performance data; authority to trigger departmental calculations; authority to review faculty marks submissions.
* **Object Scope**: All courses, subjects, assessments, faculty assignments, and students under their designated department.
* **Data Scope**: Department-level dashboard KPIs, student rosters, subject CO attainments, and program PO attainments.

### 2.3 FACULTY
* **Role Purpose**: Instructional staff responsible for delivering course content, setting assessments, evaluating student performance, and uploading marks for assigned subjects.
* **Organizational Scope**: Subject Assignment Scope (*Proposed Policy — Policy Decision Required*).
* **Default Permissions**: View course catalog; upload marks for active assigned subjects; view CO/PO attainments for assigned subjects; view student performance alerts for enrolled students.
* **Object Scope**: Strictly limited to assessments and marks belonging to assigned subjects.
* **Data Scope**: Subject-level student rosters, marks sheets, attainment matrices, and course outcome performance summaries.

---

## 3. Organizational Hierarchy & Attachment

The active relational data structure follows this academic hierarchy:

```
[Department]
     │
     └── [Course / Program]
               │
               ├── [Student] (enrolled in course)
               │         │
               │         ├── [Student Marks]
               │         ├── [CO Attainment]
               │         ├── [PO Attainment]
               │         ├── [Predictions]
               │         └── [Alerts]
               │
               └── [Subject] (curriculum module)
                         │
                         ├── [Course Outcomes (COs)] ──► [PO Mapping]
                         │
                         └── [Assessment]
                                   │
                                   └── [Assessment CO Mapping] ──► [Student Marks]
```

### Proposed Attachment Points:
* **ADMIN** attaches at the **Institution** root (all departments).
* **HOD** attaches at the **Department** node (managing all underlying courses, subjects, and students).
* **FACULTY** attaches dynamically at the **Subject** node via formal teaching assignments.

---

## 4. Faculty Assignment Policy

To eliminate arbitrary marks upload vulnerabilities (BOLA), faculty authorization must be grounded in an explicit **Faculty Subject Assignment** model:

```
[User (Role: Faculty)] <─── [Faculty Subject Assignment] ───> [Subject]
                                       │
                         ├── academic_year_id
                         ├── semester
                         ├── is_active (boolean)
                         └── permission_level (primary_instructor / evaluator / observer)
```

### Policy Rules:
1. **Multi-Subject Allocation**: A faculty member may hold concurrent assignments across multiple subjects within or across academic semesters.
2. **Multi-Instructor Subjects**: A subject may have multiple authorized faculty members (e.g., co-instructors, lab assistants, or section teachers).
3. **Academic Period Bound**: Assignments are valid only within the specified `academic_year_id` and `semester`.
4. **Lifecycle & Status**:
   - `ACTIVE`: Grants full read and upload/write permissions for the subject's assessments.
   - `INACTIVE` / `EXPIRED`: Revokes write/upload permissions; transitions faculty to historical read-only access.
   - `REVOKED`: Immediately terminates all access to subject management.

---

## 5. Permission Model

Permissions represent granular operations independent of role labels:

* **`READ`**: Retrieve entity metadata, catalog listings, or calculation summaries.
* **`CREATE`**: Define new entities (courses, subjects, assessments, assignments).
* **`UPDATE`**: Modify metadata or configurations of existing entities.
* **`DELETE`**: Remove non-archived entities.
* **`UPLOAD_MARKS`**: Submit and commit student evaluation mark sheets against an assessment.
* **`CALCULATE_ATTAINMENT`**: Execute the attainment calculation engine across CO and PO metrics.
* **`TRAIN_MODEL`**: Execute Machine Learning predictive model fitting and risk scoring.
* **`GENERATE_ALERTS`**: Execute automated anomaly detection rules and insert system alerts.
* **`EXPORT`**: Export student marks, attainment matrices, or NBA compliance reports.

---

## 6. Resource Model

| Resource | Read Scope | Create / Update Scope | Delete Scope | Upload / Trigger Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Department** | Institution (All) | Admin Only | Admin Only | N/A |
| **Course** | Institution (All) | Admin, HOD (Own Dept) | Admin Only | N/A |
| **Subject** | Institution (All) | Admin, HOD (Own Dept) | Admin Only | N/A |
| **Assessment** | Assigned Faculty, HOD (Dept), Admin | Assigned Faculty, HOD (Dept), Admin | Admin, HOD (Dept) | N/A |
| **Student Marks** | Assigned Faculty, HOD (Dept), Admin | Assigned Faculty (Active), Admin | Admin Only | Assigned Faculty (Active), Admin |
| **CO/PO Attainment** | Assigned Faculty (Subject), HOD (Dept), Admin | Attainment Engine Only | Admin Only | Admin, HOD (Dept) |
| **Predictions** | HOD (Dept), Admin (*Faculty: Own Students - Policy Decision Required*) | ML Engine Only | Admin Only | Admin, HOD |
| **Alerts** | Designated Recipient, HOD (Dept), Admin | Alert Engine, Admin | Admin Only | Admin, HOD |
| **Dashboard KPIs** | Role-Scoped (Faculty: Assigned; HOD: Dept; Admin: Global) | Aggregation Service | N/A | N/A |

---

## 7. Definitive Permission Matrix

| Resource | Action | Admin | HOD | Faculty | Scope Boundary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Students Roster** | READ | ALLOW | ALLOW | ALLOW | Institution (*Catalog Read*) |
| **Assessments** | READ | ALLOW | ALLOW | ALLOW | Assigned Subject (Faculty) / Dept (HOD) / Global (Admin) |
| **Assessments** | CREATE / EDIT | ALLOW | ALLOW | ALLOW | Assigned Subject Only (Faculty) |
| **Marks** | UPLOAD | ALLOW | ALLOW | ALLOW | **Active Assigned Subject Only** (*Denied if Unassigned*) |
| **Marks** | READ | ALLOW | ALLOW | ALLOW | Assigned Subject (Faculty) / Dept (HOD) |
| **CO Attainment** | READ | ALLOW | ALLOW | ALLOW | Assigned Subject (Faculty) / Dept (HOD) |
| **PO Attainment** | READ | ALLOW | ALLOW | ALLOW | Dept (HOD) / Global (Admin) |
| **Attainment** | CALCULATE | ALLOW | ALLOW | **DENY (403)**| Global / Department Scope (5B.2-A Enforced) |
| **Predictions** | GENERATE | ALLOW | ALLOW | **DENY (403)**| Global / Department Scope (5B.2-A Enforced) |
| **Predictions** | READ | ALLOW | ALLOW | ALLOW | Assigned Subject Students (Faculty) / Dept (HOD) |
| **Alerts** | GENERATE | ALLOW | ALLOW | **DENY (403)**| Global / Department Scope (5B.2-A Enforced) |
| **Alerts** | READ | ALLOW | ALLOW | ALLOW | Recipient / Assigned Faculty / Dept HOD |
| **Dashboard** | SUMMARY | ALLOW | ALLOW | ALLOW | Aggregated to User Scope |

---

## 8. Marks Upload Policy (`POST /api/uploads/marks`)

### 8.1 Core Security Invariant
A user is authorized to upload student marks for `assessment_id` if and only if:
1. The user is authenticated with an active session (`g.current_user`).
2. The user has role `admin`, **OR**
3. The user has role `hod` and the assessment belongs to a subject in their department, **OR**
4. The user has role `faculty` and possesses an **active, non-expired assignment** to the `subject_id` that owns `assessment_id`.

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

### 8.2 Denial Behavior
If an authenticated faculty member attempts to submit marks for an unassigned assessment:
* The transaction is aborted immediately before file processing or database insertion.
* The server responds with `HTTP 403 Forbidden` (`{"status": "error", "message": "Access denied: You are not assigned to this subject/assessment"}`).

---

## 9. Assessment Ownership Policy

1. **Subject Association**: Assessments are structural children of `subjects` (`assessments.subject_id`), representing institutional curriculum milestones rather than private faculty possessions.
2. **Collaborative Evaluation**: Multiple instructors assigned to the same subject may view assessments and collaborate on evaluations.
3. **Assessment Management Rights**:
   - `Admin` and `HOD`: Can create, update, or delete any assessment within their jurisdiction.
   - `Faculty`: Can create or modify assessments only for subjects where they hold an active assignment.

---

## 10. Read Data-Scope Policy

| Endpoint | Target Resource | Read Policy | Enforced Filter |
| :--- | :--- | :--- | :--- |
| `GET /api/students/` | Master Student Directory | Open Catalog Read | Full roster (or filtered by department if adopted) |
| `GET /api/assessments/` | Assessments Catalog | Scoped Read | `Faculty`: Assigned subjects only; `HOD`: Department subjects |
| `GET /api/copo/attainment` | CO Attainment Reports | Scoped Performance | `Faculty`: Assigned subjects; `HOD`/`Admin`: Dept/Global |
| `GET /api/copo/po-attainment`| PO Attainment Reports | Departmental Analytics | `HOD`/`Admin`: Department/Campus-wide |
| `GET /api/predictions/` | ML Student Risk Scores | Scoped Risk Read | `Faculty`: Enrolled students; `HOD`/`Admin`: Dept/Campus |
| `GET /api/alerts/` | Operational Alerts | Recipient Filtered | `Faculty`: `faculty_id = current_user` OR subject alerts |
| `GET /api/dashboard/summary` | Analytics Dashboard | Aggregated Scope | Metrics calculated over user's authorized scope |

---

## 11. Recommended Data-Scope Principle

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

## 12. HOD Authorization Policy

* **Departmental Jurisdiction**: An HOD's authority is bounded by their assigned `department_id`.
* **Supervisory Read Rights**: An HOD can inspect all student marks, assessment blueprints, attainment calculations, and alerts across all courses within their department.
* **Supervisory Write Rights**: An HOD may trigger batch calculations and generate alerts for their department.
* **Cross-Department Denial**: An HOD has zero administrative or write privileges over courses or subjects housed in other academic departments.

---

## 13. Admin Authorization Policy

* **Institutional Authority**: Administrators hold system-wide authority to manage user accounts, assign roles, configure global academic calendars, and execute full-institution predictive training.
* **Audit Transparency**: All administrative write and override actions are logged to immutable security audit logs.

---

## 14. Alert Authorization Policy

### 14.1 Alert Scoping Taxonomy
Alerts are classified into four explicit visibility tiers:

```
[Alert Scope Taxonomy]
   ├── GLOBAL        ──► Visible to Admin & all HODs (Campus announcements)
   ├── DEPARTMENT    ──► Visible to HOD and Faculty within specific department
   ├── SUBJECT       ──► Visible to all Faculty assigned to the referenced subject
   └── INDIVIDUAL    ──► Visible strictly to designated faculty_id
```

### 14.2 Resolution of `faculty_id = NULL`
To correct the current ambiguity where 100% of automated alerts have `faculty_id = NULL`:
* **`LOW_CO_ATTAINMENT`**: System must associate the alert with the `subject_id` of the Course Outcome. The alert is delivered to all faculty holding an active assignment for that subject.
* **`AT_RISK_STUDENT`**: System must associate the alert with the student's department/course. The alert is delivered to the department HOD and the student's current subject instructors.
* **Global / Unassigned Alerts**: If an alert has neither `faculty_id` nor `subject_id`, it is classified as `ADMIN_ONLY` and hidden from faculty views.

---

## 15. Historical Data Policy

* **Read-After-Term**: When an academic semester concludes or a faculty assignment transitions to `INACTIVE`, the faculty member retains **read-only access** to historical marks, attainments, and evaluations generated during their active tenure.
* **Write Termination**: Under no circumstances may a faculty member upload or modify marks for past academic terms once an assignment has expired.

---

## 16. Academic Context Policy (Year & Semester)

Authorization policies are evaluated with explicit reference to academic temporal context:
* Current operations require `academic_years.is_current = 1` or an active semester flag.
* Modifying closed academic years is restricted exclusively to `Admin` override workflows.

---

## 17. Section / Division Policy (*Policy Decision Required*)

* **Single-Cohort Subjects**: If a subject is taught as a single combined class, subject-level assignment is sufficient.
* **Multi-Section Subjects**: If a subject is divided into distinct sections (e.g. Section A, Section B) with separate instructors, the assignment model must incorporate `section_id` to prevent cross-section mark tampering.

---

## 18. Read vs. Write Separation

| Operation Type | Evaluation Invariant | Failure Response |
| :--- | :--- | :--- |
| **READ Operation** | Caller scope covers the entity's organizational domain. | `403 Forbidden` (or empty collection where list filtering applies). |
| **WRITE / UPLOAD Operation** | Caller possesses active, non-expired write permission on the specific object instance. | `403 Forbidden` with immediate transaction rollback. |

---

## 19. Default Deny Policy

* Any request lacking an explicit, positively verified authorization path is rejected.
* Missing tokens $\to$ `401 Unauthorized`.
* Unrecognized roles $\to$ `403 Forbidden`.
* Unassigned subject requests $\to$ `403 Forbidden`.
* Cross-department requests by HOD $\to$ `403 Forbidden`.

---

## 20. Server-Side Enforcement Invariant

All authorization logic resides on the server. The Flask application verifies `g.current_user["role"]` and relational assignment bindings at the start of every controller before calling services or executing SQL queries.

---

## 21. Client-Controlled Object IDs (BOLA Defense)

For every endpoint accepting entity keys (`assessment_id`, `student_id`, `subject_id`, `alert_id`):
```
Client Input ID ──► Query Database ──► Validate Parent Chain ──► Verify Caller Ownership ──► Execute
```
If caller context fails to match the entity's resolved parent scope, access is denied.

---

## 22. Auditability & Security Logging

The following events must generate structured JSON audit logs:
1. `AUTHZ_SUCCESS_UPLOAD`: Successful marks sheet submission (including `user_id`, `assessment_id`, record count).
2. `AUTHZ_DENIED_BOLA`: Attempted marks upload or object modification without valid assignment.
3. `AUTHZ_DENIED_RBAC`: Attempted invocation of privileged endpoints by unauthorized roles.
4. `AUTHZ_CALCULATION_TRIGGER`: Execution of attainment re-computation.
5. `AUTHZ_ASSIGNMENT_CHANGE`: Granting or revoking faculty subject assignments.

---

## 23. Authorization Failure Semantics

* **`401 Unauthorized`**: Returned when authentication is missing, expired, or invalid.
* **`403 Forbidden`**: Returned when caller identity is known, but authorization is insufficient.
* **Information Concealment**: Error messages must not leak internal database state, schema details, or third-party ownership identities (e.g., return generic *"Access denied: Insufficient permissions for this resource"*).

---

## 24. Policy Decision Register

| ID | Domain Decision | Proposed Enterprise Policy | Repository Evidence Status | Business Approval Status |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-001** | Faculty Scope | Bounded to active assigned subjects. | **MISSING IN SCHEMA** | **POLICY DECISION REQUIRED** |
| **AUTH-002** | HOD Scope | Bounded to assigned department. | **MISSING IN SCHEMA** | **POLICY DECISION REQUIRED** |
| **AUTH-003** | Admin Scope | Institution-wide authority. | **CONFIRMED** | **APPROVED** |
| **AUTH-004** | Faculty Assignment Entity | Intermediate table mapping `user_id` to `subject_id`. | **MISSING IN SCHEMA** | **POLICY DECISION REQUIRED** |
| **AUTH-005** | Multiple Faculty per Subject | Allowed (co-instructors / lab evaluators). | **UNKNOWN** | **POLICY DECISION REQUIRED** |
| **AUTH-006** | Academic Year Context | Assignments scoped to `academic_year_id`. | `academic_years` table exists | **PROPOSED** |
| **AUTH-007** | Semester Context | Assignments scoped to `subjects.semester`. | `subjects.semester` exists | **PROPOSED** |
| **AUTH-008** | Section Scope | Subdivide subject assignments by section. | **MISSING IN SCHEMA** | **POLICY DECISION REQUIRED** |
| **AUTH-009** | Marks Upload Authorization | Restricted strictly to assigned faculty. | **CONFIRMED BOLA GAP** | **PROPOSED** |
| **AUTH-010** | Assessment Ownership | Subject-level ownership with assigned evaluator rights. | **CONFIRMED ARCHITECTURE** | **PROPOSED** |
| **AUTH-011** | Historical Data Access | Historical read allowed; past write denied. | **PROPOSED POLICY** | **POLICY DECISION REQUIRED** |
| **AUTH-012** | Student Directory Visibility | Open catalog read across all faculty. | Current runtime returns all | **POLICY DECISION REQUIRED** |
| **AUTH-013** | Assessment Visibility | Visible only to assigned faculty & department HOD. | Current runtime returns all | **POLICY DECISION REQUIRED** |
| **AUTH-014** | Marks Visibility | Visible only to assigned faculty & department HOD. | Current runtime unscoped | **POLICY DECISION REQUIRED** |
| **AUTH-015** | CO/PO Visibility | CO: Subject faculty; PO: Dept HOD & Admin. | Current runtime unscoped | **POLICY DECISION REQUIRED** |
| **AUTH-016** | Prediction Visibility | Department HOD & enrolled subject faculty. | Current runtime unscoped | **POLICY DECISION REQUIRED** |
| **AUTH-017** | Alert Distribution Model | Route by subject assignment & department. | `alerts.faculty_id` exists | **POLICY DECISION REQUIRED** |
| **AUTH-018** | `faculty_id = NULL` Semantics | System alerts routed by `subject_id` / `dept_id`. | All 1,989 rows NULL | **POLICY DECISION REQUIRED** |
| **AUTH-019** | Dashboard Scoping | Aggregate KPIs to user's authorized domain. | Current runtime global | **POLICY DECISION REQUIRED** |
| **AUTH-020** | Security Audit Logging | Structured logging of sensitive operations. | Not implemented in runtime | **PROPOSED** |

---

## 25. Final Conceptual Authorization Model

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

## 26. Final Proposed Permission Matrix

| Resource | Action | Admin | HOD | Faculty | Scope Boundary | Context Constraint |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Departments** | READ / MANAGE | ALLOW | READ ONLY | READ ONLY | Institution | Global |
| **Courses** | READ / MANAGE | ALLOW | MANAGE (Dept) | READ ONLY | Department | Global |
| **Subjects** | READ / MANAGE | ALLOW | MANAGE (Dept) | READ ONLY | Department | Active Semester |
| **Assignments**| CREATE / REVOKE | ALLOW | ALLOW (Dept) | **DENY** | Department | Academic Year |
| **Assessments** | CREATE / EDIT | ALLOW | ALLOW (Dept) | ALLOW (Assigned) | Assigned Subject | Active Term |
| **Marks** | UPLOAD | ALLOW | ALLOW (Dept) | ALLOW (Assigned) | Assigned Subject | **Active Assignment** |
| **Marks** | READ | ALLOW | ALLOW (Dept) | ALLOW (Assigned) | Assigned Subject | Current + Historical |
| **CO Reports** | READ | ALLOW | ALLOW (Dept) | ALLOW (Assigned) | Assigned Subject | Academic Year |
| **PO Reports** | READ | ALLOW | ALLOW (Dept) | READ ONLY | Department | Academic Year |
| **Calculations**| TRIGGER | ALLOW | ALLOW (Dept) | **DENY (403)** | Global / Dept | 5B.2-A Enforced |
| **Predictions** | GENERATE | ALLOW | ALLOW (Dept) | **DENY (403)** | Global / Dept | 5B.2-A Enforced |
| **Predictions** | READ | ALLOW | ALLOW (Dept) | ALLOW (Students)| Assigned Subject | Active Term |
| **Alerts** | READ | ALL | DEPT ALERTS | OWN / SUBJECT | Recipient / Subject| Unread / Active |
| **Dashboard** | VIEW | GLOBAL | DEPT KPI | SUBJECT KPI | User Domain | Real-Time |

---

## 27. Implementation Requirements (Pre-requisites for 5B.2-B)

When approved, the future implementation phase will require:
1. **Domain Model Extensions**:
   - Defining a `faculty_subject_assignments` relation linking `user_id`, `subject_id`, `academic_year_id`, and `is_active`.
   - Adding a `department_id` foreign key on `users` for HOD and faculty department affiliation.
2. **Object-Level Authorization Helper**:
   - Creating a reusable helper (e.g. `verify_subject_assignment(user_id, subject_id)`) to validate ownership chains before mutations.
3. **Scoped Query Filtering**:
   - Refactoring `GET` route queries in `assessments.py`, `copo.py`, and `alerts.py` to accept caller-scoped parameter bindings.
4. **Alert Routing Remediation**:
   - Updating [backend/services/alert_service.py](file:///d:/Desktop/copo-vision/backend/services/alert_service.py) to tag alerts with appropriate subject/department identifiers.

---

## 28. Security Acceptance Criteria

1. **BOLA Prevention**: An authenticated faculty member attempting to upload marks to an assessment belonging to an unassigned subject is rejected with `HTTP 403 Forbidden`.
2. **Tamper Resistance**: Tampering with `assessment_id` in form submissions or query parameters cannot bypass subject authorization boundaries.
3. **Zero Privilege Escalation**: Submitting client-controlled roles (e.g. `role=admin`) in request payloads has zero effect on access decisions.
4. **HOD Isolation**: An HOD cannot modify assessments or upload marks for subjects belonging to another department.
5. **Historical Integrity**: Inactive or expired faculty assignments cannot be used to submit new marks.
6. **Alert Privacy**: Faculty members only receive alerts relevant to their assigned subjects or explicitly addressed to their user account.
7. **Complete Auth Separation**: Unauthenticated calls fail with `401`; unauthorized calls fail with `403`.
8. **Regression Safety**: All 52 existing backend tests continue to pass without regression.

---

## 29. Scope Control Statement

* **Code Status**: No application code modified.
* **Schema Status**: No MySQL database tables or migrations modified.
* **Git Status**: No commits, pushes, or pull requests executed.
* **Purpose**: This policy serves as the official design contract for enterprise authorization review.
