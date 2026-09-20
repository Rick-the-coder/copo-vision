from werkzeug.security import generate_password_hash
from config.database import get_db_connection

password = "Faculty@123"

password_hash = generate_password_hash(password)

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
        "faculty1",
        password_hash,
        "Demo Faculty",
        "faculty",
        1
    )
)

connection.commit()

cursor.close()
connection.close()

print("Faculty account created successfully.")