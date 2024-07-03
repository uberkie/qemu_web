from flask import Flask


from flask_socketio import SocketIO

from dotenv import load_dotenv
import os
import mysql.connector
from mysql.connector import Error
# Import routes and socket events
from . import routes, socketio_events

# Import models
from .models import User
load_dotenv()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)
# In-memory storage for demonstration purposes

sessions = {}
vms = []
state = None

# Path to your UI folder containing static files
ui_folder_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ui")

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
db = SQLAlchemy(app)
migrate = Migrate(app, db)

if __name__ == "__main__":
    socketio.run( app)