import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.abspath('.'))

import app.db.base
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.department import Department
from app.core import security
from sqlalchemy.orm import Session

db = SessionLocal()

def create_user_if_not_exists(session: Session, email: str, name: str, role: UserRole, password: str = None):
    if not password:
        password = os.getenv("DEFAULT_USER_PASSWORD")
    user = session.query(User).filter_by(email=email).first()
    if not user:
        if not password or not password.strip():
            raise RuntimeError(
                "DEFAULT_USER_PASSWORD environment variable must be set before creating seeded users."
            )
        hashed_pw = security.get_password_hash(password.strip())
        user = User(
            email=email,
            name=name,
            password=hashed_pw,
            role=role,
            status=True
        )
        session.add(user)
        try:
            session.commit()
            print(f"Created {role.value} account: {email}")
        except Exception as e:
            session.rollback()
            print(f"Skipped creating {email} due to error: {str(e)}")
    else:
        # Activate it if inactive
        if not user.status:
            user.status = True
            try:
                session.commit()
                print(f"Activated {role.value} account: {email}")
            except Exception as e:
                session.rollback()
                print(f"Failed to activate {email}")
    return user

def main():
    print("Adding and activating User accounts for HODs, Faculty, and Students...")

    # 1. Add HOD data and activate it
    departments = db.query(Department).all()
    for dept in departments:
        hod_email = f"hod_{dept.department_code.lower()}@copovision.com"
        hod_name = dept.hod_name or f"HOD {dept.department_code}"
        create_user_if_not_exists(db, hod_email, hod_name, UserRole.HOD)

    # 2. Add Faculty User accounts
    faculties = db.query(Faculty).all()
    for fac in faculties:
        create_user_if_not_exists(db, fac.email, fac.faculty_name, UserRole.FACULTY)

    # 3. Add Student User accounts
    students = db.query(Student).all()
    for stu in students:
        create_user_if_not_exists(db, stu.email, stu.student_name, UserRole.STUDENT)

    print("All users added and activated successfully.")
    
    # 4. Check Marks Entry Data
    from app.models.student_mark import StudentMark
    marks = db.query(StudentMark).count()
    print(f"Total Student Marks entries in database: {marks}")

if __name__ == "__main__":
    main()
