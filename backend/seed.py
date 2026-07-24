from app.db.session import SessionLocal
from app import crud
from app.schemas.user import UserCreate
from app.models.user import UserRole

def init_db():
    db = SessionLocal()
    user = crud.user.get_by_email(db, email="admin@copovision.com")
    if not user:
        user_in = UserCreate(
            email="admin@copovision.com",
            password="adminpassword",
            name="Super Admin",
            role=UserRole.ADMIN,
            status=True
        )
        user = crud.user.create(db, obj_in=user_in)
        print("Admin user created successfully.")
    else:
        print("Admin user already exists.")
    db.close()

if __name__ == "__main__":
    init_db()
