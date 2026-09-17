import os
import sys
from datetime import date

# Add backend directory to sys.path
sys.path.append(os.path.abspath('.'))

import app.db.base  # This imports all models so SQLAlchemy mapper works
from app.db.session import SessionLocal
from app.models.department import Department
from app.models.program import Program
from app.models.academic_year import AcademicYear
from app.models.semester import Semester
from app.models.course import Course
from app.models.faculty import Faculty
from app.models.section import Section
from app.models.assessment_type import AssessmentType

from app.models.curriculum import Curriculum
from app.models.course_offering import CourseOffering
from app.models.student import Student
from app.models.course_outcome import CourseOutcome
from app.models.po_models import ProgramOutcome, ProgramSpecificOutcome, POConfiguration
from app.models.co_configuration import COConfiguration
from app.models.attainment_rule import AttainmentRule
from app.models.assessment_weightage import AssessmentWeightage
from app.models.academic_calendar import AcademicCalendar

db = SessionLocal()

def get_or_create(session, model, defaults=None, **kwargs):
    instance = session.query(model).filter_by(**kwargs).first()
    if instance:
        return instance
    else:
        params = dict((k, v) for k, v in kwargs.items())
        if defaults:
            params.update(defaults)
        instance = model(**params)
        session.add(instance)
        session.commit()
        session.refresh(instance)
        return instance

def fill_all():
    print("Filling missing sections...")
    
    # Base Data
    departments = db.query(Department).all()
    programs = db.query(Program).all()
    courses = db.query(Course).all()
    faculty = db.query(Faculty).all()
    semesters = db.query(Semester).all()
    sections = db.query(Section).all()
    academic_years = db.query(AcademicYear).all()
    assessment_types = db.query(AssessmentType).all()

    if not programs or not courses or not academic_years:
        print("Required base data missing. Please run seed_demo.py first.")
        return

    # 1. Curriculum
    print("Populating Curriculums...")
    for prog in programs:
        prog_courses = [c.id for c in courses if c.department_id == prog.department_id]
        get_or_create(db, Curriculum, curriculum_name=f"Curriculum 2023 - {prog.program_name}", defaults={
            "version": "1.0",
            "department_id": prog.department_id,
            "program_id": prog.id,
            "effective_date": date(2023, 7, 1),
            "status": True,
            "courses_included": prog_courses
        })

    # 2. Course Offering
    print("Populating Course Offerings...")
    if faculty and semesters and sections and academic_years:
        for course in courses:
            get_or_create(db, CourseOffering, course_id=course.id, defaults={
                "faculty_id": faculty[0].id,
                "semester_id": semesters[0].id,
                "section_id": sections[0].id,
                "academic_year_id": academic_years[0].id,
                "status": True
            })

    # 3. Program Specific Outcomes (PSOs)
    print("Populating PSOs...")
    pso_titles = ["Software Engineering Practices", "System Administration", "AI/ML Applications"]
    for dept in departments:
        for i, title in enumerate(pso_titles):
            get_or_create(db, ProgramSpecificOutcome, pso_number=f"PSO{i+1}", department_id=dept.id, defaults={
                "pso_title": title,
                "pso_description": f"Ability to demonstrate {title.lower()}",
                "status": True
            })

    # 4. Configurations
    print("Populating Configurations...")
    get_or_create(db, COConfiguration, id=1, defaults={
        "target_percentage": 65.0,
        "calculation_method": "Weighted Average",
        "round_off_rules": "Standard",
        "minimum_student_count": 10,
        "status": True
    })

    get_or_create(db, POConfiguration, id=1, defaults={
        "target_percentage": 70.0,
        "correlation_scale": 3,
        "calculation_method": "Weighted Average",
        "attainment_levels": "Level 1, Level 2, Level 3",
        "passing_rules": "Strict",
        "status": True
    })

    # 5. Attainment Rules
    print("Populating Attainment Rules...")
    rules = [
        ("Level 0", 0.0, 39.9),
        ("Level 1", 40.0, 59.9),
        ("Level 2", 60.0, 79.9),
        ("Level 3", 80.0, 100.0)
    ]
    for name, min_p, max_p in rules:
        get_or_create(db, AttainmentRule, level_name=name, defaults={
            "min_percentage": min_p,
            "max_percentage": max_p,
            "status": True
        })

    # 6. Assessment Weightages
    print("Populating Assessment Weightages...")
    for course in courses:
        for at in assessment_types:
            weight = 30.0 if "CAE" in at.name else 40.0 if "Laboratory" in at.name else 20.0 if "Assignment" in at.name else 10.0
            get_or_create(db, AssessmentWeightage, assessment_type_id=at.id, course_id=course.id, defaults={
                "weightage_percentage": weight,
                "is_active": True
            })

    # 7. Academic Calendar
    print("Populating Academic Calendar...")
    for ay in academic_years:
        for sem in semesters:
            get_or_create(db, AcademicCalendar, academic_year_id=ay.id, semester_id=sem.id, defaults={
                "start_date": ay.start_date,
                "end_date": ay.end_date,
                "internal_exam_dates": ["2025-09-15", "2025-11-20"],
                "practical_dates": ["2025-11-25", "2025-12-05"],
                "assignment_deadlines": ["2025-08-30", "2025-10-30"],
                "holiday_list": ["2025-10-02", "2025-10-24"]
            })

    print("Successfully filled all remaining sections.")

if __name__ == "__main__":
    fill_all()
