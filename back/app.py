from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from chat import chat_bp
from functions_api import functions_bp
from routes.tasks import tasks_bp
from routes.adv_chat import adv_chat_bp
from google import genai

from models import db

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)

# Enable CORS
CORS(app)

app.register_blueprint(chat_bp)
app.register_blueprint(functions_bp)
app.register_blueprint(tasks_bp)
app.register_blueprint(adv_chat_bp)

# Create database tables
with app.app_context():
    db.create_all()

# Sample route
@app.route('/')
def index():
    return jsonify({'message': 'Welcome to Task Management API!'})

# Health check endpoint
@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy'})

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
app.client = client

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)