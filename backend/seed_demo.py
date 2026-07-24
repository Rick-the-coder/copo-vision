import os
import sys
import random
from datetime import date, datetime

# Add backend directory to sys.path
sys.path.append(os.path.abspath('.'))

from app.db.session import SessionLocal
from app.models.department import Department
from app.models.academic_year import AcademicYear
from app.models.semester import Semester
from app.models.faculty import Faculty
from app.models.subject import Subject
from app.models.student import Student
from app.models.course_outcome import CourseOutcome
from app.models.po_models import ProgramOutcome, COPOMapping
from app.models.question_bank import QuestionBank
from app.models.assessment import Assessment
from app.models.assessment_type import AssessmentType
from app.models.student_mark import StudentMark
from app.models.program import Program
from app.models.batch import Batch
from app.models.section import Section
from app.models.course import Course

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

def seed_data():
    print("Starting synthetic data generation...")

    # 1. Departments
    print("Generating Departments...")
    cse = get_or_create(db, Department, department_code="CSE", defaults={"department_name": "Computer Science & Engineering", "hod_name": "Dr. Arvind Sharma", "status": True})
    it = get_or_create(db, Department, department_code="IT", defaults={"department_name": "Information Technology", "hod_name": "Dr. Meera Reddy", "status": True})

    # 2. Academic Year
    print("Generating Academic Year...")
    ay = get_or_create(db, AcademicYear, academic_year="2025-2026", defaults={"start_date": date(2025, 7, 1), "end_date": date(2026, 6, 30), "status": True})

    # 3. Semesters
    print("Generating Semesters...")
    sem5 = get_or_create(db, Semester, semester_number=5, academic_year_id=ay.id, defaults={"status": True})
    sem6 = get_or_create(db, Semester, semester_number=6, academic_year_id=ay.id, defaults={"status": True})

    # Required structure dependencies
    print("Generating Structure Dependencies...")
    program_cse = get_or_create(db, Program, program_code="BTECH-CSE", defaults={"program_name": "B.Tech Computer Science", "department_id": cse.id, "status": True})
    program_it = get_or_create(db, Program, program_code="BTECH-IT", defaults={"program_name": "B.Tech Information Technology", "department_id": it.id, "status": True})

    batch_2023 = get_or_create(db, Batch, batch_name="2023-2027", program_id=program_cse.id, defaults={"status": True})
    section_a = get_or_create(db, Section, section_name="Section A", batch_id=batch_2023.id, defaults={"status": True})

    # 4. Faculty
    print("Generating Faculty...")
    faculty_names = ["Dr. Rajesh Kumar", "Prof. Priya Sharma", "Dr. Amit Patel", "Prof. Sneha Gupta", "Dr. Vikram Singh"]
    faculties = []
    for i, name in enumerate(faculty_names):
        dept_id = cse.id if i < 3 else it.id
        email = f"{name.split()[-1].lower()}{i}@college.edu"
        fac = get_or_create(db, Faculty, email=email, defaults={"faculty_name": name, "phone": f"987654321{i}", "designation": "Assistant Professor", "department_id": dept_id, "status": True})
        faculties.append(fac)

    # 5. Subjects / Courses
    print("Generating Subjects & Courses...")
    subject_data = [
        ("Data Structures", "CS301", sem5.id, faculties[0].id),
        ("Operating Systems", "CS302", sem5.id, faculties[1].id),
        ("Computer Networks", "CS303", sem5.id, faculties[2].id),
        ("Database Management", "CS304", sem5.id, faculties[0].id),
        ("Software Engineering", "CS305", sem5.id, faculties[1].id),
        ("Web Technologies", "IT301", sem6.id, faculties[3].id),
        ("Cloud Computing", "IT302", sem6.id, faculties[4].id),
        ("Machine Learning", "IT303", sem6.id, faculties[3].id),
        ("Information Security", "IT304", sem6.id, faculties[4].id),
        ("IoT Systems", "IT305", sem6.id, faculties[3].id),
    ]
    
    courses = []
    subjects = []
    for name, code, sem_id, fac_id in subject_data:
        course = get_or_create(db, Course, course_code=code, defaults={"course_name": name, "department_id": cse.id if sem_id == sem5.id else it.id, "status": True})
        courses.append(course)

        sub = get_or_create(db, Subject, subject_code=code, defaults={"subject_name": name, "semester": 5 if sem_id == sem5.id else 6, "credits": 4, "course_id": course.id, "faculty_id": fac_id, "status": True})
        subjects.append(sub)

    # 6. Students
    print("Generating Students...")
    first_names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Riaan", "Krishna", "Ishaan", "Shaurya", "Aanya", "Diya", "Navya", "Kavya", "Ananya", "Myra", "Saanvi", "Priya", "Riya", "Aisha", "Rahul", "Karan", "Rohit", "Sneha", "Neha"]
    last_names = ["Sharma", "Verma", "Gupta", "Patel", "Singh", "Kumar", "Reddy", "Rao", "Das", "Joshi", "Bansal", "Agarwal", "Nair", "Menon", "Kapoor"]
    
    students = []
    # 25 CSE Sem V
    for i in range(25):
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        roll = f"25CSE{str(i+1).zfill(3)}"
        stu = get_or_create(db, Student, roll_number=roll, defaults={"student_name": name, "email": f"{roll.lower()}@college.edu", "phone": f"99{str(random.randint(10000000, 99999999))}", "department_id": cse.id, "semester_id": sem5.id, "program_id": program_cse.id, "batch_id": batch_2023.id, "section_id": section_a.id, "status": True})
        students.append(stu)
        
    # 25 IT Sem VI
    for i in range(25):
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        roll = f"25IT{str(i+1).zfill(3)}"
        stu = get_or_create(db, Student, roll_number=roll, defaults={"student_name": name, "email": f"{roll.lower()}@college.edu", "phone": f"98{str(random.randint(10000000, 99999999))}", "department_id": it.id, "semester_id": sem6.id, "program_id": program_it.id, "batch_id": batch_2023.id, "section_id": section_a.id, "status": True})
        students.append(stu)

    # 7. Program Outcomes (POs)
    print("Generating POs...")
    po_titles = [
        "Engineering Knowledge", "Problem Analysis", "Design/Development of Solutions", "Conduct Investigations of Complex Problems",
        "Modern Tool Usage", "The Engineer and Society", "Environment and Sustainability", "Ethics",
        "Individual and Team Work", "Communication", "Project Management and Finance", "Life-long Learning"
    ]
    
    pos = []
    for dept in [cse, it]:
        for i, title in enumerate(po_titles):
            po = get_or_create(db, ProgramOutcome, po_number=f"PO{i+1}", department_id=dept.id, defaults={"po_title": title, "po_description": f"Description for {title}", "status": True})
            pos.append(po)

    # 8 & 9. Course Outcomes (COs) & CO-PO Mapping
    print("Generating COs and Mappings...")
    cos = []
    for course in courses:
        for i in range(1, 5): # 4 COs per course
            co = get_or_create(db, CourseOutcome, course_id=course.id, co_number=f"CO{i}", defaults={"co_title": f"Course Outcome {i}", "co_description": f"Understand and apply concepts related to CO{i} for {course.course_name}", "target_percentage": 70.0, "status": True})
            cos.append(co)
    
    for co in cos:
        dept_id = cse.id if co.course_id <= 5 else it.id 
        dept_pos = [p for p in pos if p.department_id == dept_id]
        
        for po in dept_pos:
            # check if mapping exists
            existing = db.query(COPOMapping).filter_by(course_id=co.course_id, co_id=co.id, po_id=po.id).first()
            if not existing:
                mapping = COPOMapping(course_id=co.course_id, co_id=co.id, po_id=po.id, correlation_level=random.choice([0, 1, 2, 2, 3, 3]))
                db.add(mapping)
    db.commit()

    # 10. Question Bank
    print("Generating Question Bank...")
    questions = []
    for subject in subjects:
        num_qs = random.randint(6, 10)
        course_id = subject.course_id
        subject_cos = [c for c in cos if c.course_id == course_id]
        
        for i in range(num_qs):
            co = random.choice(subject_cos)
            q_num = f"Q{i+1}_{subject.subject_code}"
            q = get_or_create(db, QuestionBank, course_id=course_id, question_number=q_num, defaults={"unit": random.randint(1, 5), "question_text": f"Explain concept {i+1} related to {subject.subject_name}.", "maximum_marks": 10.0, "question_type": "Descriptive", "difficulty_level": random.choice(["Easy", "Medium", "Hard"]), "bloom_level": random.choice(["L1", "L2", "L3", "L4"]), "co_id": co.id, "status": True})
            questions.append(q)

    # 11. Assessments & Marks
    print("Generating Assessments and Marks...")
    types = ["CAE-1", "CAE-2", "Assignment", "Laboratory"]
    assessment_types = []
    for t in types:
        at = get_or_create(db, AssessmentType, name=t, defaults={"description": f"{t} Assessment", "status": True})
        assessment_types.append(at)
    
    for subject in subjects:
        course_id = subject.course_id
        sem_id = sem5.id if subject.semester == 5 else sem6.id
        dept_students = [s for s in students if s.semester_id == sem_id]
        subject_qs = [q for q in questions if q.course_id == course_id]
        
        for at in assessment_types:
            asmnt_name = f"{at.name} for {subject.subject_code}"
            asmnt = get_or_create(db, Assessment, assessment_name=asmnt_name, course_id=course_id, defaults={"assessment_type_id": at.id, "semester_id": sem_id, "academic_year_id": ay.id, "faculty_id": subject.faculty_id, "maximum_marks": 100.0, "passing_marks": 40.0, "weightage": 25.0, "schedule_date": date(2025, 9, 15), "status": True})
            
            # Skip marks generation if marks already exist for this assessment
            existing_marks = db.query(StudentMark).filter_by(assessment_id=asmnt.id).first()
            if existing_marks:
                continue

            asmnt_qs = random.sample(subject_qs, min(3, len(subject_qs)))
            
            for stu in dept_students:
                tier = random.choices([1, 2, 3], weights=[15, 70, 15])[0]
                
                for q in asmnt_qs:
                    max_m = q.maximum_marks
                    if tier == 1:
                        mark = random.uniform(max_m * 0.2, max_m * 0.5)
                    elif tier == 2:
                        mark = random.uniform(max_m * 0.5, max_m * 0.8)
                    else:
                        mark = random.uniform(max_m * 0.8, max_m * 1.0)
                        
                    sm = StudentMark(student_id=stu.id, assessment_id=asmnt.id, question_id=q.id, marks_obtained=round(mark, 1), remarks="Good", attendance_status="Present", is_final_submission=True)
                    db.add(sm)
    
    db.commit()
    print("Successfully generated all synthetic data.")

if __name__ == "__main__":
    seed_data()
