from dotenv import load_dotenv
import os
import mysql.connector

load_dotenv()

db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_name = os.getenv('DB_NAME')

def create_database_and_user():
    connection = mysql.connector.connect(
        host='localhost',
        user=db_user,
        password=db_password
    )

    cursor = connection.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
    cursor.execute(f"USE {db_name}")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        )
    """)
    cursor.execute("""
        INSERT INTO users (username, password) VALUES ('admin', 'hashed_password_here')
    """)
    connection.commit()
    cursor.close()
    connection.close()

if __name__ == '__main__':
    create_database_and_user()