import os
from app.db.session import SessionLocal
from app import crud
from app.schemas.user import UserCreate
from app.models.user import UserRole

def init_db():
    admin_email = os.getenv("SEED_ADMIN_EMAIL", "admin@copovision.com")

    db = SessionLocal()
    user = crud.user.get_by_email(db, email=admin_email)
    if not user:
        admin_password = os.getenv("SEED_ADMIN_PASSWORD")
        if not admin_password or not admin_password.strip():
            db.close()
            raise RuntimeError(
                "SEED_ADMIN_PASSWORD environment variable must be set before creating the admin account."
            )
        user_in = UserCreate(
            email=admin_email,
            password=admin_password.strip(),
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
