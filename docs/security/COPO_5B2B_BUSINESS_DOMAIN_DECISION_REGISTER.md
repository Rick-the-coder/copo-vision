# COPO 5B.2-B Business & Domain Decision Register
## Object-Level Authorization & Data Scope Governance Specification

**Document Version:** 1.0.0  
**Status:** BLOCKED — PENDING BUSINESS & DOMAIN MODEL APPROVAL  
**Phase:** 5B.2-B (Decision Preparation & Dependency Specification)  
**Target Platform:** COPO Vision Academic Analytics Platform (Flask 3.x / MySQL Runtime)  

---

## 1. Purpose

This document serves as the formal **Business & Domain Decision Register** for Phase 5B.2-B of the COPO Vision security remediation program. 

Implementation of Object-Level Authorization (OWASP API3:2023) and multi-tenant data scoping is currently **BLOCKED**. While Function-Level Role-Based Access Control (RBAC) has been implemented and verified, object-level authorization cannot be engineered safely until institutional stakeholders make foundational policy decisions and approve the underlying domain relationships.

This register details:
1. The three candidate authorization models under institutional review.
2. Resource-by-resource authorization and privacy boundaries.
3. Explicit business governance questions requiring stakeholder sign-off.
4. Relational domain-model prerequisites that must precede database schema design.
5. End-to-end dependency chains required to safely remediate confirmed vulnerabilities (such as the marks upload BOLA).

> [!IMPORTANT]
> **Governance Boundary**: This document does not unilaterally decide academic policy or invent missing organizational relationships. It exposes policy choices, technical trade-offs, and security impacts for stakeholder determination.

---

## 2. Current Security State

The current security baseline of the active Flask/MySQL runtime is established as follows:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5A. GLOBAL AUTHENTICATION (Bearer JWT + DB State Verification)              │
│ Status: CLOSED & VERIFIED (HTTP 401 on missing/invalid credentials)         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5B.2-A. FUNCTION-LEVEL RBAC (@require_roles('admin', 'hod'))                │
│ Status: CLOSED & VERIFIED (HTTP 403 for unauthorized roles on 3 endpoints)  │
│   • POST /api/copo/calculate                                                │
│   • POST /api/predictions/generate                                          │
│   • POST /api/alerts/generate                                               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5B.2-B. OBJECT-LEVEL AUTHORIZATION & DATA SCOPING                           │
│ Status: BLOCKED / NOT IMPLEMENTED                                           │
│ Blocked by: Missing Business Policies & Missing Relational Domain Model     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Confirmed Vulnerability: Marks Upload BOLA (`POST /api/uploads/marks`)
* **Finding**: `CONFIRMED OBJECT-LEVEL AUTHORIZATION VULNERABILITY` (Broken Object Level Authorization / IDOR).
* **Vulnerability Mechanism**: The endpoint accepts a client-supplied `assessment_id` in multipart form submissions. The server verifies that the assessment exists in MySQL and binds `upload_batches.uploaded_by` to the authenticated caller (`g.current_user["user_id"]`), but **does not verify whether the authenticated caller is authorized to upload marks for that specific assessment**.
* **Security Invariant**: **`EXISTENCE ≠ AUTHORIZATION`**. Validating that an entity exists in the database does not establish that the caller owns or is assigned to manage that entity.
* **Remediation Status**: `PROPOSED / NOT IMPLEMENTED`. Remediation is blocked pending stakeholder approval of the faculty-subject assignment policy and schema implementation.

---

## 3. Current Domain Model & Verified Active Relationships

A rigorous audit of the active MySQL database schema and Flask controllers establishes the following active relationships and architectural gaps:

```
                                [departments]
                                      │
                                      ▼ (1:N)
                                  [courses]
                                      │
                         ┌────────────┴────────────┐
                         ▼ (1:N)                   ▼ (1:N)
                     [subjects]                [students]
                         │                         │
                         ▼ (1:N)                   │
                   [assessments]                   │
                         │                         │
                         ▼ (1:N via mapping)       │
                   [student_marks] ◄───────────────┘ (1:N)
```

### Verified Active Entities & Fields:
* **`users`**: `user_id`, `username`, `password_hash`, `full_name`, `role` (`'admin'`, `'faculty'`, `'hod'`), `is_active`, `created_at`.
* **`departments`**: `department_id`, `department_code`, `department_name`.
* **`courses`**: `course_id`, `department_id`, `course_code`, `course_name`, `duration_years`.
* **`subjects`**: `subject_id`, `course_id`, `subject_code`, `subject_name`, `semester`.
* **`assessments`**: `assessment_id`, `subject_id`, `assessment_name`, `assessment_type`, `max_marks`, `assessment_date`.
* **`students`**: `student_id`, `enrollment_no`, `student_name`, `course_id`, `academic_year_id`.
* **`student_subject_enrollment`**: `enrollment_id`, `student_id`, `subject_id`, `academic_year_id`, `is_repeat`, `enrolled_at`.
* **`upload_batches`**: `upload_id`, `file_name`, `uploaded_by` (FK $\to$ `users.user_id`), `records_processed`, `status`, `uploaded_at`.
* **`alerts`**: `alert_id`, `student_id`, `faculty_id` (Nullable FK $\to$ `users.user_id`), `alert_type`, `co_id`, `po_id`, `message`, `severity`, `is_read`, `created_at`.

### Critical Domain Gaps (Missing Relationships):
1. **No Faculty $\to$ Department Relationship**: The `users` table does not contain `department_id`.
2. **No Faculty $\to$ Subject Assignment**: No relational table links an instructor (`users.user_id`) to a curriculum subject (`subjects.subject_id`).
3. **No HOD $\to$ Department Tenancy**: No foreign key links an HOD user to their specific administrative department.
4. **No Assessment Creator / Owner**: `assessments` links only to `subject_id` and contains no `created_by` or instructor assignment reference.
5. **No Alert Department / Subject Routing**: `alerts` contains a nullable `faculty_id` (100% of seed rows are `NULL`) with no foreign keys to `department_id` or `subject_id`.

---

## 4. Authorization Models Under Consideration

Stakeholders must evaluate and select from three structural authorization paradigms:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MODEL A: Strict Subject-Level Faculty Scope                                 │
│   • Admin   ──► Proposed Institution-wide Scope                             │
│   • HOD     ──► Proposed Department-wide Scope                              │
│   • Faculty ──► Strictly bounded to Assigned Subject(s)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ MODEL B: Department-Level Faculty Scope                                     │
│   • Admin   ──► Proposed Institution-wide Scope                             │
│   • HOD     ──► Proposed Department-wide Scope                              │
│   • Faculty ──► Department-wide (Peer visibility across subjects)           │
├─────────────────────────────────────────────────────────────────────────────┤
│ MODEL C: Institution-Wide Read + Subject-Scoped Write (Hybrid)              │
│   • Admin   ──► Full Global Read / Write                                    │
│   • HOD     ──► Global Read / Department-Scoped Write                       │
│   • Faculty ──► Global Reference Read / Strictly Scoped Evaluation Write    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Comparative Technical Analysis Matrix

| Evaluation Dimension | Model A (Subject Scope) | Model B (Department Scope) | Model C (Hybrid Read/Write) |
| :--- | :--- | :--- | :--- |
| **Faculty Marks Upload** | Bounded strictly to assigned subjects. | Bounded to department subjects. | Bounded strictly to assigned subjects. |
| **Faculty Marks Read** | Only marks for assigned subjects. | All student marks across department. | Assigned subjects only (or Dept-wide if approved). |
| **Assessment Blueprint Read** | Assigned subjects only. | All department assessments. | Globally visible catalog across all courses. |
| **Student Roster Read** | Enrolled students in assigned subjects. | All students in department courses. | Open student directory for authenticated users. |
| **CO / PO Attainment Read** | Direct subject outcomes only. | Department aggregated outcomes. | Open reference catalog for accreditation review. |
| **ML Risk Prediction Read** | Enrolled students in assigned subjects. | All at-risk students in department. | Assigned students + Department advisors. |
| **System Alerts Read** | Subject-routed alerts only. | All departmental alert feeds. | Filtered by role and recipient taxonomy. |
| **Access Boundary Scope** | Provides subject-level isolation. | Provides department-level visibility. | Separates broader read access from scoped write operations. |
| **Domain Model Implication** | Requires faculty-subject assignment entity. | Requires user department entity linkage. | Requires faculty-subject assignment entity and catalog access policy. |
| **Administrative Granularity** | Requires explicit assignment per subject. | Relies on departmental tenancy. | Requires explicit assignment for evaluation rights. |

---

## 5. Resource Authorization Matrix

The table below details the current implementation state, security exposures, candidate scopes, and governance dependencies for every academic resource:

| Resource | Current Implementation State | Current Security Exposure | Candidate Scope | Business Decision Required? | Domain Model Required? | Decision ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Departments** | Global catalog read; no write route. | Low (Reference data). | Admin Write; All Read. | No (Standard master data). | None. | `AUTH-030`, `AUTH-003` |
| **2. Courses** | Global catalog read; no write route. | Low (Reference data). | Admin/HOD Write; All Read. | `YES` (HOD write rights). | `users.department_id`. | `AUTH-030`, `AUTH-026` |
| **3. Subjects** | Global catalog read; no write route. | Low (Reference data). | Admin/HOD Write; All Read. | `YES` (HOD write rights). | `users.department_id`. | `AUTH-030`, `AUTH-026` |
| **4. Faculty Assignments** | **Absent from system**. | Critical (No assignment checks possible). | Admin/HOD Manage; Faculty View Own. | `YES` (Assignment policy). | `faculty_subject_assignments`. | `AUTH-004`, `AUTH-001` |
| **5. Assessments** | Read/Create unscoped by user. | High (Arbitrary assessment creation). | Assigned Faculty + Dept HOD. | `YES` (Lifecycle & edit rules).| `assessments.created_by`. | `AUTH-013`, `AUTH-021`, `AUTH-022` |
| **6. Marks** | Upload unverified (`BOLA`); Read unscoped. | Confirmed BOLA: object-level authorization for assessment target is not enforced. | Active Assigned Faculty Only. | `YES` (Co-teaching & grading).| `faculty_subject_assignments`. | `AUTH-009`, `AUTH-014` |
| **7. Student Roster** | `GET /api/students/` returns all students. | Medium (Student data exposure). | Open vs. Dept vs. Subject-enrolled. | `YES` (Student privacy policy).| `student_subject_enrollment`. | `AUTH-012` |
| **8. CO Attainment** | Unscoped calculation view. | Low-Medium (Curriculum metrics). | Assigned Faculty + Dept HOD. | `YES` (Outcome visibility). | `faculty_subject_assignments`. | `AUTH-015` |
| **9. PO Attainment** | Unscoped calculation view. | Low-Medium (Department metrics). | HOD/Admin + Faculty derived. | `YES` (Program metrics scope). | `users.department_id`. | `AUTH-016` |
| **10. Predictions** | `GET /api/predictions/` returns all scores. | High (Predictive risk scores leak). | Assigned Faculty + HOD Advisor. | `YES` (Risk score privacy). | `enrollments` / Dept link. | `AUTH-025` |
| **11. Alerts** | Returns all alerts (`faculty_id = NULL`). | High (Alert routing failure). | Filtered by Recipient/Subject/Dept. | `YES` (Alert routing policy). | `alerts.subject_id` / `dept_id`.| `AUTH-018` |
| **12. Dashboard** | `GET /api/dashboard/summary` global aggregate. | Medium (Metric aggregation leakage). | Aggregated strictly to user scope. | `YES` (KPI visibility). | Scope resolution utilities. | `AUTH-019` |
| **13. Reports / Exports** | No export routes in Flask backend. | Medium (Compliance data control). | Assigned Faculty + Dept HOD. | `YES` (Export authorization). | Audit trail integration. | `AUTH-023` |

---

## 6. Business Decision Register

Every decision below requires formal review and determination by **Business, Academic, and Product Stakeholders**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DECISION REGISTER SUMMARY                                                                      │
│ Total Decisions: 15 Unresolved Business Policy Items                                           │
│ Status: 100% PENDING STAKEHOLDER DETERMINATION                                                 │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### `AUTH-005` & `AUTH-024`: Co-Teaching & Multi-Instructor Grading Rights
* **Decision Title**: Multi-Instructor Subject Allocation & Delegation Hierarchy
* **Context**: In higher education, laboratory modules, large lecture classes, or multidisciplinary subjects may be staffed by multiple faculty members.
* **Stakeholder Questions**:
  1. Can multiple faculty members be concurrently assigned to teach a single subject?
  2. If multiple faculty are assigned, do all co-instructors possess equal rights to upload and overwrite student marks?
  3. Should the system introduce explicit assignment roles (e.g., `PRIMARY_INSTRUCTOR` vs. `CO_INSTRUCTOR` vs. `LAB_EVALUATOR`)?
  4. Can a co-instructor modify an assessment blueprint created by another instructor?
  5. Can a primary instructor reassign or revoke permissions for co-instructors?
* **Candidate Policy Options**:
  - *Option 1 (Flat Model)*: All assigned faculty have symmetric read/write rights for the subject.
  - *Option 2 (Hierarchical Model)*: A designated `PRIMARY_INSTRUCTOR` manages assessments and approves marks; `CO_INSTRUCTOR` enters draft marks only.
* **Security Impact**: Symmetrical write access increases the risk of accidental mark overwrites and complicates individual accountability.
* **Domain Model Dependency**: `faculty_subject_assignments.assignment_role` (`PRIMARY`, `SECONDARY`, `EVALUATOR`).
* **Implementation Dependency**: Marks upload validation controller.
* **Stakeholder Owner**: Dean of Academics / Academic Council.
* **Approval Status**: `PENDING`.

---

### `AUTH-008`: Section / Division Granularity
* **Decision Title**: Section / Division Scoping for Large Cohorts
* **Context**: An academic course cohort of 180 students may be partitioned into three sections (Division A, Division B, Division C) taught by different instructors.
* **Stakeholder Questions**:
  1. Does authorization require division-level boundaries (`Section A`, `Section B`)?
  2. Can an instructor assigned to Section A upload or view marks for students in Section B?
  3. Is section merely descriptive student metadata, or is it a hard security and authorization boundary?
* **Candidate Policy Options**:
  - *Option 1 (Subject Boundary Only)*: Any instructor assigned to the subject can evaluate any student enrolled in that subject regardless of section.
  - *Option 2 (Section Boundary)*: Instructors can only upload marks for students enrolled in their specifically assigned section.
* **Security Impact**: Cross-section mark tampering if section boundaries are omitted in multi-section institutions.
* **Domain Model Dependency**: Introduction of a `sections` entity or `section` attribute on `faculty_subject_assignments` and `student_subject_enrollment`.
* **Implementation Dependency**: Marks validation against student section enrollment.
* **Stakeholder Owner**: Registrar / Academic Operations.
* **Approval Status**: `PENDING`.

---

### `AUTH-011`: Historical Data Access & Post-Term Write Lockout
* **Decision Title**: Academic Lifecycle Transition & Historical Data Retention
* **Context**: When an academic semester finishes, grades are finalized and archived for accreditation.
* **Stakeholder Questions**:
  1. Does a faculty member retain read access to student marks and assessment blueprints for subjects they taught in past academic years?
  2. Should write permissions (marks upload, assessment editing) immediately terminate upon semester conclusion?
  3. What is the grace period (e.g., 14 days post-semester) during which grade rectifications are permitted?
  4. Who can authorize modifications to historical marks (HOD only or Admin only)?
* **Candidate Policy Options**:
  - *Option 1 (Strict Lockout)*: Expired assignments immediately convert to read-only access. Historic modifications require formal Admin override.
  - *Option 2 (Temporal Grace Period)*: Write permissions remain open for $N$ days post-term before transitioning to permanent read-only status.
* **Security Impact**: Unrestricted historical write permissions violate academic integrity and NBA compliance audit trails.
* **Domain Model Dependency**: `academic_years.is_current` and `faculty_subject_assignments.is_active`.
* **Implementation Dependency**: Date/lifecycle check in `uploads.py`.
* **Stakeholder Owner**: Examination Cell / Controller of Examinations.
* **Approval Status**: `PENDING`.

---

### `AUTH-012`: Master Student Directory Visibility
* **Decision Title**: Student Directory & Profile Privacy Scoping
* **Context**: `GET /api/students/` currently returns all students across all departments and programs.
* **Stakeholder Questions**:
  1. Should the student directory be globally readable across all authenticated faculty for interdisciplinary advising?
  2. Should student profiles be filtered strictly to students enrolled in the faculty member's assigned subjects?
  3. Should HODs be restricted strictly to students within their department's courses?
* **Candidate Policy Options**:
  - *Option 1 (Open Academic Directory)*: All authenticated faculty can view student catalog metadata (Name, Enrollment No, Course).
  - *Option 2 (Department-Bounded Directory)*: Users can only view students enrolled in courses within their department.
  - *Option 3 (Instructional Scope)*: Faculty can only search/view students actively enrolled in their assigned subjects.
* **Security Impact**: Unscoped rosters expose student directory metadata across unrelated academic departments.
* **Domain Model Dependency**: Filtering queries via `users.department_id` or `student_subject_enrollment`.
* **Implementation Dependency**: `backend/routes/students.py` query filtering.
* **Stakeholder Owner**: Student Affairs / Data Privacy Officer.
* **Approval Status**: `PENDING`.

---

### `AUTH-013` & `AUTH-014`: Assessment Blueprint & Student Marks Read Visibility
* **Decision Title**: Departmental vs. Assigned Subject Scoping for Marks and Assessments
* **Context**: Determining whether peer instructors within the same department may view each other's assessment designs and student evaluation marks.
* **Stakeholder Questions**:
  1. Can a faculty member view student marks for a subject taught by a peer in the same department?
  2. Are assessment question papers and CO weightings considered open departmental assets or private instructor drafts?
  3. Does an HOD have unrestricted read visibility across all subjects in their department?
* **Candidate Policy Options**:
  - *Option 1 (Strict Instructor Isolation)*: Faculty can only view assessments and marks for subjects they are actively assigned to teach.
  - *Option 2 (Departmental Transparency)*: Faculty can view marks and assessments across all subjects within their department, but write access remains strictly assignment-scoped.
* **Security Impact**: Departmental transparency allows peer review but reduces student grade privacy across course instructors.
* **Domain Model Dependency**: Multi-tenant SQL filters on `assessments` and `student_marks`.
* **Implementation Dependency**: `assessments.py` and `copo.py` controllers.
* **Stakeholder Owner**: Heads of Departments / Faculty Senate.
* **Approval Status**: `PENDING`.

---

### `AUTH-015` & `AUTH-016`: Course Outcome (CO) & Program Outcome (PO) Attainment Visibility
* **Decision Title**: Outcome Attainment Metric Visibility & Aggregation Boundaries
* **Context**: CO attainments measure subject mastery; PO attainments aggregate across multiple subjects to measure graduate attributes for accreditation.
* **Stakeholder Questions**:
  1. Can faculty view PO attainment reports that aggregate data outside their specific subject?
  2. Should department-level PO attainment matrices be visible exclusively to HODs, Department Coordinators, and Administrators?
  3. Are historical attainment trends open for faculty research?
* **Candidate Policy Options**:
  - *Option 1 (Curriculum Scoping)*: Faculty view subject-specific CO attainments; PO attainments are restricted to HODs and Program Coordinators.
  - *Option 2 (Full Transparency)*: All outcome attainment reports are open to all department faculty for NBA self-assessment reporting.
* **Security Impact**: High-level attainment metrics do not expose raw student grades but reflect institutional program efficacy.
* **Domain Model Dependency**: Scoped calculation queries in `backend/routes/copo.py`.
* **Implementation Dependency**: Attainment retrieval endpoints.
* **Stakeholder Owner**: Accreditation Coordinator (NBA/NAAC Lead).
* **Approval Status**: `PENDING`.

---

### `AUTH-018`: Alert Routing & Resolution of `faculty_id = NULL`
* **Decision Title**: Alert Taxonomy, Recipient Targeting, and NULL Semantics
* **Context**: Currently, 100% of the 1,989 automated alerts in the database have `faculty_id = NULL`.
* **Stakeholder Questions**:
  1. What does `faculty_id = NULL` signify in the system? Does it mean "Global Broadcast", "Unassigned Anomaly", or "Admin Only"?
  2. When a `LOW_CO_ATTAINMENT` alert is generated, who should receive it (Subject Instructor, Course Coordinator, or HOD)?
  3. When an `AT_RISK_STUDENT` alert is generated, should it route to the student's Academic Mentor, Class Advisor, or all current Subject Instructors?
  4. Can faculty dismiss/mark-as-read alerts that are routed to multiple instructors?
* **Candidate Policy Options**:
  - *Option 1 (Explicit Entity Routing)*: System alerts are explicitly tagged with `subject_id` or `department_id`; queries match active assignments.
  - *Option 2 (Broadcast Tiers)*: Alerts have explicit `scope` enums (`GLOBAL`, `DEPARTMENT`, `SUBJECT`, `INDIVIDUAL`).
* **Security Impact**: Ambiguous alert routing causes sensitive student academic intervention notices to be leaked globally or missed entirely.
* **Domain Model Dependency**: Adding `subject_id` and `department_id` to `alerts` table.
* **Implementation Dependency**: `backend/routes/alerts.py` and `backend/services/alert_service.py`.
* **Stakeholder Owner**: Student Counseling / Academic Monitoring Committee.
* **Approval Status**: `PENDING`.

---

### `AUTH-021` & `AUTH-022`: Assessment Lifecycle, Creation, and Deletion Authority
* **Decision Title**: Assessment Blueprint Creation, Editing, and Archival Governance
* **Context**: Assessments link directly to curriculum subjects and define the weighting for all student marks.
* **Stakeholder Questions**:
  1. Can faculty create new assessments (e.g. Midterms, Quizzes) independently, or are assessments created strictly by Department HODs?
  2. Under what conditions may an assessment be permanently deleted?
  3. If an assessment already contains uploaded student marks, should permanent hard deletion be prohibited in favor of soft archival?
  4. Can an HOD edit or override an assessment blueprint created by a faculty member?
* **Candidate Policy Options**:
  - *Option 1 (Faculty Autonomy)*: Assigned faculty create and edit assessments for their subjects. Deletion is permitted only if mark count $= 0$.
  - *Option 2 (HOD Centralization)*: Assessments are approved and locked by HODs; faculty only enter evaluation marks.
* **Security Impact**: Hard deletion of assessments with active marks creates dangling records and corrupts attainment calculations.
* **Domain Model Dependency**: `assessments.created_by`, `assessments.is_archived`.
* **Implementation Dependency**: `backend/routes/assessments.py`.
* **Stakeholder Owner**: Academic Curriculum Committee.
* **Approval Status**: `PENDING`.

---

### `AUTH-023`: Academic Report & Mark Sheet Export Permissions
* **Decision Title**: Data Export Governance & Compliance Auditing
* **Context**: Exporting mark sheets, student performance tables, and NBA compliance reports to Excel/PDF.
* **Stakeholder Questions**:
  1. Who is authorized to export raw student evaluation marks?
  2. Can faculty export marks only for their assigned subjects?
  3. Can HODs export complete department grade books?
  4. Should every bulk export event trigger a high-priority security audit log?
* **Candidate Policy Options**:
  - *Option 1 (Scoped Export)*: Export rights mirror read rights (Faculty export own subjects; HOD exports department).
  - *Option 2 (Administrative Export Only)*: Raw mark sheet exports require HOD or Exam Cell authorization.
* **Security Impact**: Uncontrolled bulk export is a primary vector for student privacy breaches and FERPA/data protection violations.
* **Domain Model Dependency**: Security audit logging integration.
* **Implementation Dependency**: Export route handlers.
* **Stakeholder Owner**: Controller of Examinations / Compliance Office.
* **Approval Status**: `PENDING`.

---

### `AUTH-025`: Machine Learning Risk Prediction Visibility
* **Decision Title**: Predictive Analytics & Student Failure Risk Access Policy
* **Context**: `GET /api/predictions/` provides ML-generated risk classifications and predicted outcome attainments.
* **Stakeholder Questions**:
  1. Who is authorized to inspect student failure risk predictions?
  2. Should predictive risk scores be visible to all department faculty or restricted to designated academic counselors and HODs?
  3. Should subject instructors view predictions only for students currently enrolled in their subjects?
* **Candidate Policy Options**:
  - *Option 1 (Counselor & HOD Only)*: Risk predictions are restricted to HODs and assigned student counselors to avoid instructor grading bias.
  - *Option 2 (Assigned Instructor Access)*: Instructors view risk predictions for enrolled students to provide targeted remedial instruction.
* **Security Impact**: Unrestricted risk prediction access introduces cognitive bias and leaks sensitive predictive evaluations.
* **Domain Model Dependency**: Linking prediction queries to `student_subject_enrollment` and `users.department_id`.
* **Implementation Dependency**: `backend/routes/predictions.py`.
* **Stakeholder Owner**: Academic Mentorship Committee.
* **Approval Status**: `PENDING`.

---

### `AUTH-026`: Course and Subject Master Entity Creation
* **Decision Title**: Curriculum Master Data Management Rights
* **Context**: Creating and editing institutional Courses, Degrees, and Curriculum Subjects.
* **Stakeholder Questions**:
  1. Who is authorized to create new Course offerings?
  2. Can an HOD create and update Subjects within their own department?
  3. Is Course and Subject creation strictly an Administrator privilege?
  4. Can faculty propose or edit subject syllabus metadata?
* **Candidate Policy Options**:
  - *Option 1 (Admin Centralized)*: Only institutional Administrators can create/edit Courses and Subjects.
  - *Option 2 (HOD Departmental Delegated)*: HODs can create and modify Subjects and Course blueprints for their assigned department.
* **Security Impact**: Unauthorized subject creation leads to catalog pollution and broken course hierarchies.
* **Domain Model Dependency**: `users.department_id`.
* **Implementation Dependency**: Curriculum management controllers.
* **Stakeholder Owner**: Board of Studies / Academic Registrar.
* **Approval Status**: `PENDING`.

---

## 7. Domain Model Decision Register (Schema Requirements)

Once business policies are approved, the following relational dependencies and candidate schema designs must be evaluated for design and migration:

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│ DOMAIN MODEL REQUIREMENT SUMMARY                                                              │
│ Status: PENDING BUSINESS POLICY SIGN-OFF                                                      │
│ Note: Distinguishes Mandatory Domain Relationships from Candidate Implementation Structures  │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

```
                                  ┌────────────────────────┐
                                  │      departments       │
                                  └───────────┬────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼ (1:N)                                           ▼ (1:N)
             ┌───────────────┐                                 ┌───────────────┐
             │    courses    │                                 │     users     │ (HOD / Faculty)
             └───────┬───────┘                                 │department_id  │ [CANDIDATE FK]
                     │                                         └───────┬───────┘
                     ▼ (1:N)                                           │
             ┌───────────────┐                                         │
             │   subjects    │ ◄───────────────────────┐               │
             └───────┬───────┘                         │               │
                     │                                 │ (M:N)         │
                     │                         ┌───────┴───────────────┴───────┐
                     │                         │  faculty_subject_assignments  │ [CANDIDATE ENTITY]
                     │                         │  user_id, subject_id, year,   │
                     │                         │  semester, role, is_active    │
                     │                         └───────────────────────────────┘
                     ▼ (1:N)
             ┌───────────────┐
             │  assessments  │
             │  created_by   │ [CANDIDATE FK -> users]
             │  is_archived  │ [CANDIDATE FIELD]
             └───────────────┘
```

### 7.1 Detailed Relational Specifications

| Domain Relationship Required | Prerequisite For | Purpose & Relational Mechanism | Candidate Implementation Structure | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Faculty $\to$ Subject Instructional Link** | `AUTH-001`, `AUTH-004`, `AUTH-009`, `AUTH-013`, `AUTH-014` | Maps instructors to curriculum subjects with temporal and role context. | `faculty_subject_assignments`<br>(`user_id`, `subject_id`, `academic_year_id`, `semester`, `section_id`, `assignment_role`, `is_active`) | `DOMAIN RELATIONSHIP REQUIRED`<br>*(Schema Design: Candidate)* |
| **User $\to$ Department Tenancy** | `AUTH-002`, `AUTH-012`, `AUTH-016`, `AUTH-026` | Establishes organizational tenancy for HODs and departmental faculty. | `users.department_id`<br>(FK $\to$ `departments`, Nullable for Admins) | `DOMAIN RELATIONSHIP REQUIRED`<br>*(Schema Design: Candidate)* |
| **Assessment Authorship & Lifecycle** | `AUTH-021`, `AUTH-022` | Establishes individual assessment authorship and enables non-destructive archival. | `assessments.created_by`<br>`assessments.is_archived` | `CANDIDATE SCHEMA DESIGN`<br>*(Subject to AUTH-021/022)* |
| **Alert Scoping & Routing Metadata** | `AUTH-018` | Resolves unassigned alert ambiguity by routing notifications to curriculum nodes. | `alerts.subject_id`<br>`alerts.department_id`<br>`alerts.recipient_scope` | `CANDIDATE SCHEMA DESIGN`<br>*(Subject to AUTH-018)* |
| **Cohort Section Partitioning** | `AUTH-008` | Subdivides large student cohorts into distinct instructional sections. | `sections` table / `section_id` attributes | `CANDIDATE SCHEMA DESIGN`<br>*(Subject to AUTH-008)* |

---

## 8. BOLA Remediation Dependency Chain

Remediation of the confirmed BOLA vulnerability on `POST /api/uploads/marks` follows a non-negotiable multi-tiered dependency chain:

```
[1. Business Decision on Faculty Assignment Policy (AUTH-005, AUTH-009)]
                                │
                                ▼
[2. Domain Model Approval: faculty_subject_assignments Entity]
                                │
                                ▼
[3. Database Migration: Create faculty_subject_assignments in MySQL]
                                │
                                ▼
[4. Controller Remediation: Resolve Assessment -> Subject -> Active Assignment]
                                │
                                ▼
[5. Authorization Check: Is g.current_user actively assigned to Subject?]
                                │
                     ┌──────────┴──────────┐
                     ▼                     ▼
                  [YES]                  [NO]
                    │                      │
                    ▼                      ▼
           [Execute Mark Upload]   [HTTP 403 Forbidden]
```

### Why BOLA Remediation Cannot Be Implemented Today:
1. In the current active schema, `assessments` has a foreign key to `subjects` (`assessments.subject_id`), but **there is zero link between `subjects` and `users`**.
2. When a faculty member invokes `POST /api/uploads/marks` with `assessment_id = 5`, the backend can verify that Assessment 5 belongs to Subject 10, but **the backend cannot evaluate whether the authenticated caller is assigned to Subject 10 because that relationship does not exist anywhere in MySQL**.
3. Attempting to write an authorization check without the assignment entity would require hardcoding IDs or assuming arbitrary ownership, which is insecure and invalid.

---

## 9. Alert Scope Governance & `faculty_id = NULL` Resolution

Currently, all 1,989 automated alerts in the database have `faculty_id = NULL`.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CRITICAL SECURITY PRINCIPLE                                                 │
│ NULL SCOPE OR RECIPIENT VALUES MUST NOT BE ASSUMED TO MEAN GLOBAL VISIBILITY│
└─────────────────────────────────────────────────────────────────────────────┘
```

### Candidate Handling for Unresolved Alert Routing (Pending Stakeholder Decision)
Stakeholders must determine the policy for alerts where recipient/scoping attributes cannot be resolved (such as existing alerts with `faculty_id = NULL`):

* **Option A (Admin-Only Quarantine)**: Unassigned alerts are classified as administrative notifications and hidden from faculty views.
* **Option B (Explicit System/Global Broadcast)**: System-wide alerts are tagged with an explicit broadcast type visible across all roles.
* **Option C (Department/HOD Fallback)**: Alerts lacking an individual instructor link route to the relevant department HOD for triage.
* **Option D (Reject / Quarantine)**: Alerts lacking explicit routing context are quarantined until routing metadata is populated.

*Status*: **PENDING STAKEHOLDER DECISION**

---

## 10. Candidate Historical Access Models (Pending Stakeholder Decision)

Stakeholders must evaluate and choose the temporal rules governing access across academic terms:

* **Option A (Strict Term Termination)**:
  - Active Term: Full assigned read and write rights.
  - Expired Term: Write access immediately disabled; faculty retain read-only access to historical records for subjects previously taught.
* **Option B (Post-Term Grace Period Window)**:
  - Active Term: Full assigned read and write rights.
  - Post-Term Window: Limited correction window ($N$ days) for grade rectifications, followed by permanent read-only archive.
* **Option C (Administrative Re-Authorization)**:
  - Active Term: Full assigned read and write rights.
  - Expired Term: All historical access (read or write) requires explicit administrative re-authorization or HOD request.

*Status*: **PENDING STAKEHOLDER DECISION**

---

## 11. Implementation Approval Gate

```
================================================================================
FINAL APPROVAL GATE: 5B.2-B
Status: BLOCKED — PENDING FORMAL BUSINESS & DOMAIN MODEL APPROVAL
================================================================================
```

Under no circumstances may engineering proceed to:
1. Creating database migrations for `faculty_subject_assignments` or `department_id`,
2. Modifying controller logic in `uploads.py`, `assessments.py`, `copo.py`, or `alerts.py`,
3. Writing mock or temporary authorization bypasses,

until formal, signed approval is received from **Business Stakeholders** and **Domain Owners** on the decisions registered in Section 6 and Section 7.

---

## 12. Implementation Readiness Criteria

Phase 5B.2-B implementation will be declared **READY** only when all of the following criteria are satisfied:

- [ ] **Faculty Scope Approved**: Formal sign-off on Model A, Model B, or Model C.
- [ ] **Co-Teaching Hierarchy Approved**: Policy established for `AUTH-005` & `AUTH-024`.
- [ ] **Section Scoping Defined**: Policy established for `AUTH-008`.
- [ ] **Historical Access Defined**: Lifecycle and write lockout rules established for `AUTH-011`.
- [ ] **Assessment Lifecycle Approved**: Creation and deletion policies established for `AUTH-021` & `AUTH-022`.
- [ ] **Directory & Marks Visibility Approved**: Privacy policies established for `AUTH-012`, `AUTH-013`, `AUTH-014`.
- [ ] **Alert Routing Approved**: Taxonomy and NULL semantics approved for `AUTH-018`.
- [ ] **Predictions & Exports Approved**: Visibility policies approved for `AUTH-023` & `AUTH-025`.
- [ ] **Relational Domain Model Formally Specified**: ERD and schema design completed for `faculty_subject_assignments`, `users.department_id`, and `alerts` routing keys.

---

## 13. Scope & Safety Confirmation

* **Application Code Modified**: **NO**
* **Database Schema Modified**: **NO**
* **Migrations Created**: **NO**
* **Tests Modified**: **NO**
* **Frontend Modified**: **NO**
* **Git Operations Performed**: **NO** (No commit, push, PR, or branch operations).

---
*End of Document. Prepared for Business & Domain Stakeholder Governance Review.*
