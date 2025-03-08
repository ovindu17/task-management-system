from flask import Blueprint, jsonify
from models import db,Task

# Create Blueprint
tasks_bp = Blueprint('tasks', __name__)

# Route to fetch tasks
@tasks_bp.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    tasks_list = [{"id": task.id, "title": task.title, "description": task.description} for task in tasks]
    return jsonify(tasks_list) 