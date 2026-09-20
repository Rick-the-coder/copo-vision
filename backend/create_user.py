import os
from werkzeug.security import generate_password_hash
from config.database import get_db_connection

def create_user():
    password = os.getenv("SEED_USER_PASSWORD") or os.getenv("DEFAULT_USER_PASSWORD")
    if not password or not password.strip():
        raise RuntimeError(
            "SEED_USER_PASSWORD or DEFAULT_USER_PASSWORD environment variable must be set before creating a user."
        )

    username = os.getenv("SEED_USERNAME", "faculty1").strip()
    full_name = os.getenv("SEED_FULL_NAME", "Demo Faculty").strip()
    role = os.getenv("SEED_ROLE", "faculty").strip()

    password_hash = generate_password_hash(password.strip())

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO users
        (username, password_hash, full_name, role, is_active)
        VALUES (%s, %s, %s, %s, %s)
    """

    cursor.execute(
        query,
        (
            username,
            password_hash,
            full_name,
            role,
            1
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    print(f"User account '{username}' ({role}) created successfully.")

if __name__ == "__main__":
    create_user()