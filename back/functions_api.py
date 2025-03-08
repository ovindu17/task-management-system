from flask import Blueprint, jsonify, request
from google import genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import database and Task model from models (assuming Task is defined there)
from models import db, Task

functions_bp = Blueprint('functions', __name__)

@functions_bp.route('/function', methods=['POST'])
def function_call():
    data = request.get_json()
    user_input = data.get('message')
    if not user_input:
        return jsonify({'error': 'No message provided'}), 400
    
    try:
        client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))
        # Call the model in a synchronous manner
        response = client.models.generate_content_stream(
            model='gemini-2.0-flash',
            contents=[user_input]
        )
        
        # Collect response from all chunks
        result = ''.join([chunk.text for chunk in response if chunk.text])
        return jsonify({'response': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@functions_bp.route('/add_task', methods=['POST'])
def add_task():
    data = request.get_json()
    task_title = data.get('title')
    task_description = data.get('description', '')
    
    if not task_title:
        return jsonify({'error': 'Task title is required'}), 400
    
    try:
        # Assuming Task model has fields: id, title, description, completed
        task = Task(title=task_title, description=task_description, completed=False)
        db.session.add(task)
        db.session.commit()
        return jsonify({
            'message': 'Task added successfully',
            'task': {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'completed': task.completed
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500 