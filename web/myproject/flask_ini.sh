#!/usr/bin/env bash

# Ensure the script stops on first error and treats unset variables as errors
set -euo pipefail

echo "Initializing the database..."

# Initialize the Flask database if not already initialized
if ! flask db current >/dev/null 2>&1; then
    flask db init
else
    echo "Database already initialized"
fi

# Apply migrations
flask db migrate -m "Initial migration" || true
flask db upgrade

echo "Database migration complete."

echo "Inserting default data..."

# Run the database initialization script
python3 init_db.py

echo "Default data insertion complete."