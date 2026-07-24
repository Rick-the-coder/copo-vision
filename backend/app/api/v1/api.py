from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth, users, departments, courses, subjects, 
    academic_years, semesters, faculty, students, stats,
    programs, batchs, sections, course_offerings, curriculums, academic_calendars, audit_logs, imports,
    course_outcomes, assessment_types, assessments, question_banks, student_marks, marks,
    co_configurations, attainment_rules, assessment_weightages, co_attainments, co_attainment_historys,
    program_outcomes, program_specific_outcomes, co_po_mappings, po_configurations, po_attainments, po_attainment_historys
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(departments.router, prefix="/departments", tags=["departments"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(subjects.router, prefix="/subjects", tags=["subjects"])
api_router.include_router(academic_years.router, prefix="/academic-years", tags=["academic-years"])
api_router.include_router(semesters.router, prefix="/semesters", tags=["semesters"])
api_router.include_router(faculty.router, prefix="/faculty", tags=["faculty"])
api_router.include_router(students.router, prefix="/students", tags=["students"])
api_router.include_router(programs.router, prefix="/programs", tags=["programs"])
api_router.include_router(batchs.router, prefix="/batches", tags=["batches"])
api_router.include_router(sections.router, prefix="/sections", tags=["sections"])
api_router.include_router(course_offerings.router, prefix="/course-offerings", tags=["course-offerings"])
api_router.include_router(curriculums.router, prefix="/curriculums", tags=["curriculums"])
api_router.include_router(academic_calendars.router, prefix="/academic-calendars", tags=["academic-calendars"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["audit-logs"])
api_router.include_router(imports.router, prefix="/imports", tags=["imports"])
api_router.include_router(course_outcomes.router, prefix="/course-outcomes", tags=["course-outcomes"])
api_router.include_router(assessment_types.router, prefix="/assessment-types", tags=["assessment-types"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
api_router.include_router(question_banks.router, prefix="/question-banks", tags=["question-banks"])
api_router.include_router(student_marks.router, prefix="/student-marks", tags=["student-marks"])
api_router.include_router(marks.router, prefix="/marks", tags=["marks"])
api_router.include_router(co_configurations.router, prefix="/co-configurations", tags=["co-configurations"])
api_router.include_router(attainment_rules.router, prefix="/attainment-rules", tags=["attainment-rules"])
api_router.include_router(assessment_weightages.router, prefix="/assessment-weightages", tags=["assessment-weightages"])
api_router.include_router(co_attainments.router, prefix="/co-attainments", tags=["co-attainments"])
api_router.include_router(co_attainment_historys.router, prefix="/co-attainment-history", tags=["co-attainment-history"])

from app.api.v1.endpoints import co_engine, po_engine, ml_engine, analytics
api_router.include_router(co_engine.router, prefix="/co-engine", tags=["co-engine"])
api_router.include_router(program_outcomes.router, prefix="/program-outcomes", tags=["program-outcomes"])
api_router.include_router(program_specific_outcomes.router, prefix="/program-specific-outcomes", tags=["program-specific-outcomes"])
api_router.include_router(co_po_mappings.router, prefix="/co-po-mapping", tags=["co-po-mapping"])
api_router.include_router(po_configurations.router, prefix="/po-configurations", tags=["po-configurations"])
api_router.include_router(po_attainments.router, prefix="/po-attainments", tags=["po-attainments"])
api_router.include_router(po_attainment_historys.router, prefix="/po-attainment-history", tags=["po-attainment-history"])
api_router.include_router(ml_engine.router, prefix="/ml", tags=["ml-engine"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
