# COPO 5B.2-C Stakeholder Decision Workbook
## Business & Domain Authorization Decisions for Object-Level Access Control

**Document Version:** 1.0.0  
**Status:** DRAFT / PENDING STAKEHOLDER DECISION  
**Phase:** 5B.2-C (Stakeholder Decision Workshop Preparation)  
**Target Platform:** COPO Vision Academic Analytics Platform (Flask 3.x / MySQL Runtime)  

---

## 1. Purpose

This workbook collects and structures the formal business and academic domain authorization decisions required before engineering Object-Level Authorization (OWASP API3:2023) and Multi-Tenant Data Scoping for the COPO Vision platform.

Following the completion of **5A Authentication** and **5B.2-A Function-Level RBAC**, implementation of fine-grained object-level authorization is currently **BLOCKED**. In order to construct relational database schemas, entity relationships, and authorization filters, institutional and academic stakeholders must formally review the policy alternatives presented herein and record explicit decisions.

---

## 2. Current Security Baseline

The security and authorization baseline of the active codebase is established as follows:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5A. GLOBAL AUTHENTICATION (Bearer JWT + DB State Verification)              │
│ Status: CLOSED & VERIFIED                                                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5B.2-A. FUNCTION-LEVEL RBAC (@require_roles('admin', 'hod'))                │
│ Status: CLOSED & VERIFIED (HTTP 403 on privileged operational routes)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5B.2-B. OBJECT-LEVEL AUTHORIZATION & DATA SCOPE PREPARATION                 │
│ Status: DECISION PREPARATION COMPLETE / IMPLEMENTATION BLOCKED              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5B.2-C. BUSINESS & DOMAIN AUTHORIZATION DECISION WORKBOOK                   │
│ Status: CURRENT STAKEHOLDER GOVERNANCE PHASE                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Confirmed Vulnerability: Marks Upload BOLA (`POST /api/uploads/marks`)
* **Finding Status:** `CONFIRMED OBJECT-LEVEL AUTHORIZATION VULNERABILITY` (Broken Object Level Authorization / IDOR).
* **Vulnerability Description:** The endpoint accepts a client-supplied `assessment_id` in multipart submissions. While database existence is validated and `upload_batches.uploaded_by` is bound to the authenticated caller (`g.current_user["user_id"]`), the server does not verify whether the authenticated caller is assigned or authorized to submit marks for that specific assessment.
* **Security Invariant:** **`EXISTENCE ≠ AUTHORIZATION`**. The fact that an assessment exists in the database does not grant the caller permission to modify it.
* **Remediation Status:** `BLOCKED`. Remediation is blocked until stakeholders select the authorization scope model and approve the faculty-to-assessment governance relationship.

---

## 3. Governance Rules & Decision Recording Standards

1. **Stakeholder Authority:** Business, Academic, and Product stakeholders make the policy decisions. Security engineering documents technical consequences and implements the approved model.
2. **Neutrality Invariant:** No candidate option is pre-selected, ranked, or classified as preferred by technical staff.
3. **Explicit Decision Recording:** Every decision must be formally marked as one of the following states:
   - `APPROVED` — Policy adopted as described.
   - `REJECTED` — Policy candidate discarded.
   - `MODIFIED` — Policy adopted with specific stakeholder amendments documented.
   - `PENDING` — Decision unresolved / under active institutional discussion.
4. **Traceability:** When a policy is recorded as `MODIFIED`, the original text, amended terms, stakeholder rationale, owner, and timestamp must be preserved.
5. **Domain Model Gate:** No Entity Relationship Diagrams (ERDs), SQL schema migrations, code alterations, or BOLA patches will be implemented until the applicable decisions in this workbook are approved.

---

## 4. Decision Summary Dashboard

| Decision ID | Title | Dependency | Status | Stakeholder Decision |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-SCOPE-001** | Overall Faculty Authorization Scope Model | None (Foundational) | `PENDING` | `PENDING` |
| **AUTH-001** | Faculty to Department Relationship Multiplicity | AUTH-SCOPE-001 | `PENDING` | `PENDING` |
| **AUTH-002** | HOD Department Scope & Multi-Department Jurisdiction | AUTH-SCOPE-001 | `PENDING` | `PENDING` |
| **AUTH-004** | Faculty to Subject Assignment Granularity | AUTH-SCOPE-001 | `PENDING` | `PENDING` |
| **AUTH-005** | Co-Teaching & Shared Course Offering Governance | AUTH-004 | `PENDING` | `PENDING` |
| **AUTH-024** | Co-Instructor Assessment Modification & Deletion Rights | AUTH-005 | `PENDING` | `PENDING` |
| **AUTH-008** | Section / Division Security Boundary Enforcement | AUTH-004 | `PENDING` | `PENDING` |
| **AUTH-009** | Assessment CRUD & Evaluation Boundary | AUTH-SCOPE-001, AUTH-004 | `PENDING` | `PENDING` |
| **AUTH-013** | Assessment Modification & Deletion Authorization | AUTH-009 | `PENDING` | `PENDING` |
| **AUTH-014** | Marks Upload & Modification Authorization (BOLA Gate) | AUTH-004, AUTH-009 | `PENDING` | `PENDING` |
| **AUTH-021** | Assessment Definition Read Visibility | AUTH-SCOPE-001 | `PENDING` | `PENDING` |
| **AUTH-022** | Student Marks Read Visibility Across Faculty | AUTH-SCOPE-001 | `PENDING` | `PENDING` |
| **AUTH-012** | Student Academic Record & Directory Visibility | AUTH-SCOPE-001 | `PENDING` | `PENDING` |
| **AUTH-015** | Course Outcome (CO) Attainment Visibility Scope | AUTH-SCOPE-001 | `PENDING` | `PENDING` |
| **AUTH-016** | Program Outcome (PO) Attainment Visibility Scope | AUTH-SCOPE-001 | `PENDING` | `PENDING` |
| **AUTH-018** | Orphaned Alert Routing & Retention Governance | AUTH-001, AUTH-004 | `PENDING` | `PENDING` |
| **AUTH-025** | Student Risk Prediction Read vs Generation Scope | AUTH-SCOPE-001 | `PENDING` | `PENDING` |
| **AUTH-011** | Historical Term Access, Post-Term Correction & Archival | AUTH-SCOPE-001 | `PENDING` | `PENDING` |
| **AUTH-023** | Assessment & Attainment Data Export Permissions | AUTH-SCOPE-001 | `PENDING` | `PENDING` |
| **AUTH-026** | Course & Subject Master Data Administration Delegation | AUTH-002 | `PENDING` | `PENDING` |

---

## 5. Detailed Decision Sections

```
Decision Sequence:
Phase 1 (Scope) ──► Phase 2 (Relationships) ──► Phase 3 (Co-Teaching) ──► Phase 4 (Sections)
        │
        ▼
Phase 5 (Assessments & Marks) ──► Phase 6 (Attainments) ──► Phase 7 (Alerts) ──► Phase 8 (Predictions)
        │
        ▼
Phase 9 (Historical Terms) ──► Phase 10 (Exports) ──► Phase 11 (Master Data Delegation)
```

---

### PHASE 1 — Overall Authorization Scope

#### Decision ID: `AUTH-SCOPE-001`
* **Title:** Overall Faculty Authorization Scope Model
* **Why This Decision Is Required:** This decision establishes the core data visibility and mutation boundary for teaching staff across the entire platform. Every downstream object-level check depends on this foundational scope model.
* **Current System State:** No object-level filter exists; any authenticated faculty member can query global data endpoints.
* **Stakeholder Question:** Which authorization scope model should COPO Vision adopt for faculty access?
* **Candidate Options:**
  * **Option A: Strict Subject-Level Faculty Scope**
    * *Definition:* Faculty access is strictly confined to subjects, sections, and assessments explicitly assigned to them.
    * *Faculty Boundary:* Direct teaching assignment only.
    * *HOD Boundary:* Department-wide scope.
    * *Admin Boundary:* Institution-wide scope.
    * *Object Authorization Implication:* Requires join-based checks against teaching assignment tables for every read and write request.
    * *Domain Model Implication:* Requires mandatory, non-null relational mapping between faculty, subject, semester, and academic year.
  * **Option B: Department-Level Faculty Scope**
    * *Definition:* Faculty members have read and write/grading access to all subjects, assessments, and marks within their home department.
    * *Faculty Boundary:* Department-wide scope.
    * *HOD Boundary:* Department-wide scope.
    * *Admin Boundary:* Institution-wide scope.
    * *Object Authorization Implication:* Authorization resolves by comparing caller's `department_id` with resource's `department_id`.
    * *Domain Model Implication:* Requires faculty-to-department membership mapping; individual subject assignment is not a security boundary.
  * **Option C: Hybrid Read / Write Scope**
    * *Definition:* Faculty members have broad read visibility across department subjects/assessments for reference and benchmarking, but write/grading operations are strictly restricted to their assigned subjects.
    * *Faculty Boundary:* Read: Department-wide | Write: Assigned subjects only.
    * *HOD Boundary:* Read/Write: Department-wide.
    * *Admin Boundary:* Read/Write: Institution-wide.
    * *Object Authorization Implication:* Read queries apply department filters; mutation endpoints apply assignment-level checks.
    * *Domain Model Implication:* Requires both faculty-department membership and faculty-subject assignment tables.
* **Security / Technical Consequences:**
  * *Option A:* Limits exposure to assigned students and courses; requires complete assignment mapping to be configured before faculty can interact with the system.
  * *Option B:* Simplifies configuration and cross-subject collaboration; permits any department instructor to modify marks of peer courses.
  * *Option C:* Separates analytical reference access from evaluation integrity; requires bifurcated access-control filters for GET vs POST/PUT/DELETE routes.
* **Domain Model Dependency:** Entity relationship design for `users`, `departments`, `subjects`, and `faculty_assignments`.
* **Implementation Dependency:** Core query filters in backend data access layer.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

### PHASE 2 — Faculty / Department Relationships

#### Decision ID: `AUTH-001`
* **Title:** Faculty to Department Relationship Multiplicity
* **Why This Decision Is Required:** Academic institutions frequently employ faculty who teach across multiple departments (e.g., Mathematics faculty teaching in CSE, ECE, and Mechanical).
* **Current System State:** `users` table contains role strings without relational foreign keys linking users to departments.
* **Stakeholder Question:** Can a faculty member belong to multiple departments, or must they have a single home department?
* **Candidate Options:**
  * **Option A: Single Department Membership** (1:N Department to Faculty).
  * **Option B: Multi-Department Joint Appointment** (N:M Department to Faculty via association table).
  * **Option C: Primary Department with Cross-Department Teaching Appointments** (Single primary department with cross-department subject assignments).
* **Security / Technical Consequences:**
  * *Option A:* Simplifies department-based filtering; cannot model interdisciplinary teaching appointments without multiple user accounts.
  * *Option B:* Accommodates complex institutional appointments; requires array-based department scoping in JWT or database lookups.
  * *Option C:* Preserves single administrative reporting line while enabling fine-grained subject access across department lines.
* **Domain Model Dependency:** `users` schema foreign key vs `faculty_departments` junction table.
* **Implementation Dependency:** User profile management and department context resolution.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

#### Decision ID: `AUTH-002`
* **Title:** HOD Department Scope & Multi-Department Jurisdiction
* **Why This Decision Is Required:** To define whether an HOD's administrative authority is strictly bounded to one department or can extend to multiple departments during interim vacancies.
* **Current System State:** Role string `'hod'` exists without department boundary binding.
* **Stakeholder Question:** Does an HOD govern exactly one department, or can one user act as HOD for multiple departments?
* **Candidate Options:**
  * **Option A: Strict 1:1 HOD to Department Mapping.**
  * **Option B: 1:N HOD to Department Mapping** (One user can hold HOD role over multiple departments).
  * **Option C: Interim Delegated HOD Role** (Primary single department with time-bound secondary department delegation).
* **Security / Technical Consequences:**
  * *Option A:* Prevents cross-department administrative overreach; requires admin intervention if an HOD is temporarily on leave.
  * *Option B:* Allows administrative coverage across departments; expands write/approval blast radius.
  * *Option C:* Supports institutional continuity; introduces delegation expiration logic.
* **Domain Model Dependency:** `departments.hod_user_id` vs `hod_assignments` mapping table.
* **Implementation Dependency:** RBAC middleware department resolution for `@require_roles('hod')`.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

#### Decision ID: `AUTH-004`
* **Title:** Faculty to Subject Assignment Granularity
* **Why This Decision Is Required:** Explicit faculty assignments are the core prerequisite to remediating the marks upload BOLA and establishing grading authority.
* **Current System State:** `subjects` table does not contain faculty assignment foreign keys or temporal term associations.
* **Stakeholder Question:** How should faculty subject assignments be structured in the domain model?
* **Candidate Options:**
  * **Option A: Static Subject Assignment** (`subjects.faculty_id` direct foreign key).
  * **Option B: Time-Bound Term Assignment** (`course_offerings` mapping `faculty_id`, `subject_id`, `academic_year_id`, `semester`).
  * **Option C: Section-Specific Term Assignment** (`course_offerings` mapping `faculty_id`, `subject_id`, `section_id`, `academic_year_id`).
* **Security / Technical Consequences:**
  * *Option A:* Cannot support historical teaching records across different academic years; reassigning a subject alters past course metadata.
  * *Option B:* Supports academic term progression and historical teaching records; does not separate multiple sections within the same term.
  * *Option C:* Provides precise section-level grading boundaries; requires sections to be configured before faculty assignment.
* **Domain Model Dependency:** Creation of `course_offerings` or `faculty_subject_assignments` table.
* **Implementation Dependency:** Core prerequisite for `POST /api/uploads/marks` BOLA validation.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

### PHASE 3 — Co-Teaching

#### Decision ID: `AUTH-005`
* **Title:** Co-Teaching & Shared Course Offering Governance
* **Why This Decision Is Required:** Large university courses often feature multiple instructors sharing lectures, labs, and assessment grading for the same subject.
* **Current System State:** No co-teaching relationship exists in the data model.
* **Stakeholder Question:** Can multiple instructors be assigned to teach a single subject/offering, and how are their roles structured?
* **Candidate Options:**
  * **Option A: Single Instructor Per Offering** (Strict 1:1 faculty to offering).
  * **Option B: Flat / Symmetric Multi-Instructor Assignment** (All assigned co-instructors possess identical evaluation permissions).
  * **Option C: Hierarchical Lead / Co-Instructor Model** (`PRIMARY_INSTRUCTOR` manages configuration and approvals; `CO_INSTRUCTOR` enters marks).
* **Security / Technical Consequences:**
  * *Option A:* Simplifies ownership checks; cannot model shared courses without external account sharing.
  * *Option B:* Enables collaboration; any assigned instructor can edit assessments and submit marks.
  * *Option C:* Enforces clear accountability for syllabus configuration while delegating evaluation workload; requires role hierarchy within course offering schema.
* **Domain Model Dependency:** `offering_instructors` mapping table with optional `instructor_role` enum.
* **Implementation Dependency:** Assessment and marks authorization resolution rules.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

#### Decision ID: `AUTH-024`
* **Title:** Co-Instructor Assessment Modification & Deletion Rights
* **Why This Decision Is Required:** When multiple instructors teach a course, policies must define whether one instructor can alter or delete an assessment created by a co-instructor.
* **Current System State:** Assessments are linked to `subject_id` but do not track creator identity or co-instructor edit permissions.
* **Stakeholder Question:** May a co-instructor modify or delete assessments created by another assigned co-instructor?
* **Candidate Options:**
  * **Option A: Creator-Only Modification** (Only the creating instructor or HOD/Admin can edit/delete).
  * **Option B: Symmetric Assigned Modification** (Any instructor assigned to the course offering can edit/delete).
  * **Option C: Lead Instructor Override** (Lead instructor and creator can edit; secondary instructors can only enter marks).
* **Security / Technical Consequences:**
  * *Option A:* Prevents accidental overwriting between instructors; requires HOD intervention if creator is unavailable.
  * *Option B:* High operational flexibility; lacks modification isolation among peers.
  * *Option C:* Aligns operational grading delegation with lead faculty governance.
* **Domain Model Dependency:** `assessments.created_by` foreign key and offering role hierarchy.
* **Implementation Dependency:** `PUT /api/assessments/<id>` and `DELETE /api/assessments/<id>` authorization handlers.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

### PHASE 4 — Section / Division Scope

#### Decision ID: `AUTH-008`
* **Title:** Section / Division Security Boundary Enforcement
* **Why This Decision Is Required:** In large cohorts (e.g., CSE Section A vs Section B), institutions must decide whether a faculty member teaching Section A is permitted to view or enter marks for Section B.
* **Current System State:** `students` table maps to `course_id` and `academic_year_id`; `sections` table is not linked in foreign keys.
* **Stakeholder Question:** Is class section a strict security boundary for marks entry and student evaluation?
* **Candidate Options:**
  * **Option A: Subject-Level Boundary Only** (Any faculty assigned to the subject can evaluate all sections).
  * **Option B: Strict Section-Level Boundary** (Faculty can only evaluate students enrolled in their assigned section).
  * **Option C: Section-Level Write / Subject-Level Read** (Faculty can view all sections of their subject for grading parity, but can only enter marks for their assigned section).
* **Security / Technical Consequences:**
  * *Option A:* Simplifies grading distribution when instructors assist across sections; does not isolate section records.
  * *Option B:* Enforces strict segregation of student marks; requires detailed student-to-section enrollment mapping.
  * *Option C:* Balances cross-section grading consistency with evaluation integrity.
* **Domain Model Dependency:** `sections`, `student_section_enrollment`, and section-bound `course_offerings`.
* **Implementation Dependency:** Student list filtering and marks bulk submission authorization.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

### PHASE 5 — Assessment & Marks Authorization

#### Decision ID: `AUTH-009`
* **Title:** Assessment Definition Creation & Read Scope
* **Why This Decision Is Required:** To define who is authorized to create assessment instruments (Internal Assessments, Assignments, End-Sem Exams) for a subject.
* **Current System State:** `POST /api/assessments` allows any authenticated user to create assessments for any `subject_id`.
* **Stakeholder Question:** Who is permitted to define and create assessments for a subject?
* **Candidate Options:**
  * **Option A: Assigned Faculty and Department HOD/Admin Only.**
  * **Option B: Department Faculty, HOD, and Admin.**
  * **Option C: HOD and Admin Only** (Centralized assessment creation; faculty only enter marks).
* **Security / Technical Consequences:**
  * *Option A:* Prevents unassigned faculty from creating assessments for courses they do not teach.
  * *Option B:* Enables shared departmental question paper creation; expands creation scope.
  * *Option C:* Guarantees standardized assessment structures across departments; shifts administrative burden to HOD.
* **Domain Model Dependency:** `course_offerings` teaching assignment validation.
* **Implementation Dependency:** `POST /api/assessments` authorization middleware.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

#### Decision ID: `AUTH-013`
* **Title:** Assessment Modification & Deletion Authorization
* **Why This Decision Is Required:** Modifying assessment weights or deleting assessments after marks have been entered invalidates existing CO attainment calculations.
* **Current System State:** `PUT` and `DELETE /api/assessments/<id>` lack role and ownership checks.
* **Stakeholder Question:** Under what conditions and by whom may an assessment definition be updated or deleted?
* **Candidate Options:**
  * **Option A: Assigned Faculty / Creator Only (Pre-Marks Entry)**; Locked once marks exist.
  * **Option B: HOD / Admin Override Required** once marks exist.
  * **Option C: Soft-Delete / Archival Only** (Assessments with marks cannot be hard-deleted).
* **Security / Technical Consequences:**
  * *Option A:* Protects calculation integrity by freezing structure once evaluation begins.
  * *Option B:* Allows administrative corrections of weightage mistakes with supervisor oversight.
  * *Option C:* Preserves audit trails for NBA/NAAC accreditation reviews.
* **Domain Model Dependency:** `assessments.status` / `is_locked` flags and marks count checks.
* **Implementation Dependency:** `PUT` and `DELETE /api/assessments/<id>` business rule enforcement.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

#### Decision ID: `AUTH-014`
* **Title:** Marks Upload & Modification Authorization (BOLA Remediation Gate)
* **Why This Decision Is Required:** Remediation of the confirmed BOLA vulnerability on `POST /api/uploads/marks` is blocked until this decision defines which users are authorized to submit marks for an assessment.
* **Current System State:** `POST /api/uploads/marks` accepts arbitrary `assessment_id` without verifying caller teaching assignment.
* **Stakeholder Question:** Who is authorized to upload and modify student marks for a given assessment?
* **Candidate Options:**
  * **Option A: Assigned Faculty for the Subject/Offering Only** (Admin/HOD read-only during term; write override via audit log).
  * **Option B: Assigned Faculty, Department HOD, and Admin** (Direct write access for supervisory roles).
  * **Option C: Primary Assigned Faculty Only** (Co-instructors and HOD submit mark change requests).
* **Security / Technical Consequences:**
  * *Option A:* Directly resolves BOLA by verifying caller against `course_offerings` for the assessment's subject; enforces least privilege.
  * *Option B:* Provides operational bypass for HODs; requires audit logging to track marks entered on behalf of faculty.
  * *Option C:* Strict single-custodian accountability; adds friction to grading assistance.
* **Domain Model Dependency:** `course_offerings`, `assessments`, and `student_marks` relationships.
* **Implementation Dependency:** `POST /api/uploads/marks` and `POST /api/marks/bulk` BOLA remediation handler.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

#### Decision ID: `AUTH-021`
* **Title:** Assessment Definition Read Visibility
* **Why This Decision Is Required:** To decide if exam structures and question banks are open for peer review within a department or strictly private to assigned teachers.
* **Current System State:** `GET /api/assessments` returns all assessments globally.
* **Stakeholder Question:** Can faculty members view assessment structures created by peer faculty for other subjects?
* **Candidate Options:**
  * **Option A: Assigned Subject Scope Only.**
  * **Option B: Department-Wide Read Visibility.**
  * **Option C: Institution-Wide Read Visibility.**
* **Security / Technical Consequences:**
  * *Option A:* High privacy between course instructors; prevents cross-pollination of assessment design.
  * *Option B:* Facilitates internal departmental moderation and OBE benchmarking.
  * *Option C:* Open curriculum repository across university faculties.
* **Domain Model Dependency:** Query filter scope in `assessments.py`.
* **Implementation Dependency:** `GET /api/assessments` response filtering.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

#### Decision ID: `AUTH-022`
* **Title:** Student Marks Read Visibility Across Faculty
* **Why This Decision Is Required:** Student marks contain sensitive academic performance data subject to institutional privacy policies.
* **Current System State:** `student_marks` endpoints lack object-level read scoping.
* **Stakeholder Question:** Can a faculty member view student marks awarded in other subjects by other teachers?
* **Candidate Options:**
  * **Option A: Assigned Subject Scope Only** (Faculty can only see marks for their own subjects).
  * **Option B: Class Advisor / Mentor Scope** (Assigned subject marks + full semester marks for advised cohort).
  * **Option C: Department-Wide Faculty Visibility** (Any department teacher can view marks of any department student).
* **Security / Technical Consequences:**
  * *Option A:* Enforces strict student data privacy and grading confidentiality.
  * *Option B:* Enables holistic student academic counseling without granting universal access.
  * *Option C:* Maximum transparency; increases risk of unauthorized student record disclosure.
* **Domain Model Dependency:** `student_mentors` / `class_advisors` mapping table.
* **Implementation Dependency:** Marks query filter layer.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

### PHASE 6 — Student / CO / PO Visibility

#### Decision ID: `AUTH-012`
* **Title:** Student Academic Record & Directory Visibility
* **Why This Decision Is Required:** To define what student profile attributes (contact information, enrollment details, academic standing) are accessible to different roles.
* **Current System State:** `GET /api/students` returns all registered students institution-wide.
* **Stakeholder Question:** What directory scope and data fields should be visible to faculty?
* **Candidate Options:**
  * **Option A: Assigned Subject Enrollment Scope Only** (Faculty only sees students enrolled in their active classes).
  * **Option B: Department-Bounded Student Directory** (Faculty sees all students in their department).
  * **Option C: Institutional Directory** (All active students visible across university).
* **Security / Technical Consequences:**
  * *Option A:* Minimizes student data exposure; faculty cannot search students outside their teaching roster.
  * *Option B:* Standard departmental academic visibility.
  * *Option C:* Broad visibility; requires field-level redaction of phone and personal contact details.
* **Domain Model Dependency:** `student_subject_enrollment` join queries.
* **Implementation Dependency:** `GET /api/students` scoping.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

#### Decision ID: `AUTH-015`
* **Title:** Course Outcome (CO) Attainment Visibility Scope
* **Why This Decision Is Required:** CO attainment represents calculated course performance against defined outcome targets.
* **Current System State:** `GET /api/copo/attainment` returns all student CO records.
* **Stakeholder Question:** What is the visibility scope for Course Outcome attainment data?
* **Candidate Options:**
  * **Option A: Assigned Subject Scope for Faculty; Department Scope for HOD; Global for Admin.**
  * **Option B: Department Scope for All Faculty; Global for Admin.**
  * **Option C: Student Self-Scope** (Students view only their own CO attainment records).
* **Security / Technical Consequences:**
  * *Option A:* Restricts granular student attainment to responsible instructors and supervisors.
  * *Option B:* Encourages peer review and departmental outcome analysis.
  * *Option C:* Essential for student learner self-monitoring in OBE frameworks.
* **Domain Model Dependency:** `co_attainment` join filtering.
* **Implementation Dependency:** `GET /api/copo/attainment` and `GET /api/co-attainments`.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

#### Decision ID: `AUTH-016`
* **Title:** Program Outcome (PO) Attainment Visibility Scope
* **Why This Decision Is Required:** Program Outcomes reflect aggregate graduation competencies governed by HODs and Program Assessment Committees.
* **Current System State:** `GET /api/copo/po-attainment` returns all student PO attainment records.
* **Stakeholder Question:** Who may view aggregate and student-level Program Outcome attainment?
* **Candidate Options:**
  * **Option A: HOD and Admin Only** (Faculty excluded from PO attainment calculations).
  * **Option B: Faculty Department View (Aggregates Only)**; Student-level PO attainment restricted to HOD/Admin.
  * **Option C: Universal Academic Access** (All faculty and students view PO attainment).
* **Security / Technical Consequences:**
  * *Option A:* Centralizes accreditation metric governance at department leadership level.
  * *Option B:* Provides faculty with macro curricular feedback without exposing sensitive student-level PO scores.
  * *Option C:* Full transparency across program stakeholders.
* **Domain Model Dependency:** Aggregate vs student-level PO query abstractions.
* **Implementation Dependency:** `GET /api/copo/po-attainment` and `GET /api/po-attainments`.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

### PHASE 7 — Alert Routing

#### Decision ID: `AUTH-018`
* **Title:** Orphaned Alert Routing & Retention Governance
* **Why This Decision Is Required:** The `alerts` table currently allows `faculty_id` to be `NULL`. A formal policy is needed to govern who receives and manages unassigned or orphaned alerts.
* **Current System State:** `alerts.faculty_id` can be `NULL`; `GET /api/alerts/unread` does not enforce strict recipient isolation.
* **Stakeholder Question:** How should alerts with `faculty_id = NULL` be routed, and who has authority to acknowledge shared alerts?
* **Candidate Options:**
  * **Option A: Department HOD Fallback Routing** (Unassigned alerts route automatically to the respective department HOD).
  * **Option B: System Administrator Quarantine** (Orphaned alerts route exclusively to Admin review console).
  * **Option C: Rejection at Generation** (Alert generator rejects alerts that cannot resolve an assigned faculty recipient).
* **Security / Technical Consequences:**
  * *Option A:* Ensures academic alerts (e.g., low attainment) are reviewed by department leadership; requires alert-to-department resolution.
  * *Option B:* Prevents unauthorized exposure of student risk indicators; increases Admin triage burden.
  * *Option C:* Guarantees 100% recipient binding; may suppress critical alerts if subject assignment is unmapped.
* **Domain Model Dependency:** `alerts.department_id` and non-null `faculty_id` constraints.
* **Implementation Dependency:** `services/alerts.py` generation and `routes/alerts.py` query filtering.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

### PHASE 8 — Prediction Visibility

#### Decision ID: `AUTH-025`
* **Title:** Student Risk Prediction Read vs Generation Scope
* **Why This Decision Is Required:** Predictive ML models generate student failure and attainment risk classifications (`AT_RISK`, `AVERAGE`, `GOOD`), which require strict ethical and privacy controls.
* **Current System State:** Generation is restricted to Admin/HOD via RBAC; read endpoint `GET /api/predictions` returns all predictions globally.
* **Stakeholder Question:** Who is authorized to view student risk predictions, and at what granularity?
* **Candidate Options:**
  * **Option A: HOD and Admin Only** (Faculty cannot view ML risk scores).
  * **Option B: Assigned Faculty (Course Scope Only)** + HOD (Department Scope) + Admin (Global).
  * **Option C: Designated Academic Counselors / Class Mentors Only.**
* **Security / Technical Consequences:**
  * *Option A:* Minimizes potential algorithmic bias in grading; prevents instructors from taking early remedial action.
  * *Option B:* Enables proactive remedial intervention by active course instructors; exposes ML risk labels to teachers.
  * *Option C:* Concentrates risk management in student welfare officers.
* **Domain Model Dependency:** Prediction scoping queries bound to student enrollment and teaching assignments.
* **Implementation Dependency:** `GET /api/predictions` authorization filter and `routes/ml.py` prediction handlers.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

### PHASE 9 — Historical Access

#### Decision ID: `AUTH-011`
* **Title:** Historical Term Access, Post-Term Correction & Archival
* **Why This Decision Is Required:** Academic semesters conclude, but marks corrections and accreditation audits occur months or years later. Access policies must define how write permissions transition post-term.
* **Current System State:** No term status or locking mechanism exists; all active records remain mutable indefinitely.
* **Stakeholder Question:** What access rules govern completed academic terms and historical records?
* **Candidate Options:**
  * **Option A: Immediate Post-Term Lock** (All historical records become read-only upon term end; modification requires Admin unlock).
  * **Option B: Grace Period Model** (15-day post-term window for faculty corrections; HOD approval required thereafter).
  * **Option C: Tiered Archival Governance** (Current Term: Read/Write | Previous Term: HOD Approved Edit | Archived Years: Immutable Read-Only).
* **Security / Technical Consequences:**
  * *Option A:* Maximum protection against unauthorized historical grade tampering; high administrative overhead for routine grade corrections.
  * *Option B:* Accommodates normal exam re-evaluation and grievance cycles with automated expiration.
  * *Option C:* Matches institutional accreditation compliance workflows with clear audit trails.
* **Domain Model Dependency:** `academic_years.status` (`ACTIVE`, `GRACE_PERIOD`, `LOCKED`, `ARCHIVED`) and `term_locking_records`.
* **Implementation Dependency:** Temporal authorization validation in mutation endpoints.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

### PHASE 10 — Export Permissions

#### Decision ID: `AUTH-023`
* **Title:** Assessment & Attainment Data Export Permissions
* **Why This Decision Is Required:** Bulk CSV/Excel exports extract mass student performance data outside platform security controls.
* **Current System State:** Export utilities execute in frontend without backend scope enforcement.
* **Stakeholder Question:** Who is authorized to export raw student marks and attainment reports?
* **Candidate Options:**
  * **Option A: Admin and HOD Only** (Faculty export disabled).
  * **Option B: Role-Scoped Export** (Faculty: Assigned subjects only; HOD: Department; Admin: Global).
  * **Option C: Role-Scoped Export with Mandatory Server-Side Audit Logging.**
* **Security / Technical Consequences:**
  * *Option A:* Strong data loss prevention; creates administrative bottlenecks for faculty preparing accreditation binders.
  * *Option B:* Balances operational utility with scoped boundaries.
  * *Option C:* Provides traceability for data extraction activities in compliance with privacy regulations.
* **Domain Model Dependency:** `audit_logs` export event schema.
* **Implementation Dependency:** Dedicated backend export endpoints with authorization checks.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

### PHASE 11 — Course / Subject Master Administration

#### Decision ID: `AUTH-026`
* **Title:** Course & Subject Master Data Administration Delegation
* **Why This Decision Is Required:** To establish whether syllabus, subject catalog, and outcome configurations are managed centrally by administrators or delegated to department heads.
* **Current System State:** Master data endpoints allow Admin operations without explicit department scoping for HODs.
* **Stakeholder Question:** Who holds authority to create, edit, and configure subjects, COs, and POs?
* **Candidate Options:**
  * **Option A: Centralized Administrator Control** (Only Admin creates courses, subjects, and outcomes).
  * **Option B: Departmental Delegation to HOD** (HOD creates and manages subjects, COs, and PSOs within their department; Admin manages global degrees and POs).
  * **Option C: Collaborative Faculty Proposal / HOD Approval Workflow** (Faculty drafts COs; HOD approves into curriculum).
* **Security / Technical Consequences:**
  * *Option A:* Strict centralized control; slow turnaround for departmental curriculum updates.
  * *Option B:* Empowers academic department autonomy while maintaining department isolation.
  * *Option C:* Accurately reflects academic Board of Studies workflows; requires draft/published lifecycle states.
* **Domain Model Dependency:** `subjects.department_id`, `course_outcomes.status` lifecycle enum.
* **Implementation Dependency:** Scoped authorization checks on `master_data.py` routes.
* **Stakeholder Decision:** `PENDING`
* **Rationale:** `PENDING STAKEHOLDER INPUT`
* **Decision Owner:** `STAKEHOLDER TO SPECIFY`
* **Approval Date:** `PENDING`

---

## 6. Decision Recording Template (For Stakeholder Workshops)

When completing decisions during governance sessions, stakeholders must record their determination in the following format:

```markdown
### Decision Record: [DECISION_ID]
- **Status:** [APPROVED | REJECTED | MODIFIED]
- **Selected Option:** [Option A | Option B | Option C | Custom]
- **Modified Policy Details (if applicable):** [Detailed text of amendment]
- **Institutional Rationale:** [Why this policy was chosen]
- **Decision Owner:** [Name, Title, Academic Department / Leadership Role]
- **Approval Date:** [YYYY-MM-DD]
```

---

## 7. Domain Model & Implementation Roadmap (Post-Approval Gate)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Stakeholder Decision Sign-off (COPO_5B2C_STAKEHOLDER_DECISION_WORKBOOK.md)│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Relational Domain Model & ERD Finalization                           │
│   • Define course_offerings, faculty_assignments, section_enrollments       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: MySQL Database Migrations                                           │
│   • Apply foreign keys, constraints, and audit tables                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Object-Level Authorization Middleware & Endpoint Remediation        │
│   • Remediate POST /api/uploads/marks BOLA vulnerability                    │
│   • Enforce scoped query filters across all resource routes                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: Automated Security & Regression Testing                             │
│   • Multi-tenant cross-user authorization tests                             │
│   • BOLA exploit regression suite                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```
