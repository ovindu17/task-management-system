from flask import Blueprint, request, jsonify, current_app
from google import genai
from dotenv import load_dotenv
from google.genai.types import FunctionDeclaration, GenerateContentConfig, Part, Tool
import os
from models import db, Task

# Load environment variables
load_dotenv()

# Function Declarations
add_task_func = FunctionDeclaration(
    name="add_task",
    description="Add a new task to the database,if the user asks to add a task without providing the title, description, or status ask for them always by starting the response with 'Provide task details:' never start with anything else",
    #description="Add a new task to the database,if the user asks to add a task without providing the title, description, or status ask for them always send  a htmlform starting with a form tag with the fields title, description, and status",
    parameters={
        "type": "object",
        "properties": {
            "title": {"type": "string", "description": "The title of the task"},
            "description": {"type": "string", "description": "A detailed description of the task"},
            "status": {
                "type": "string",
                "description": "The status of the task (pending, completed, etc.)",
                "enum": ["pending", "completed", "in_progress"]
            }
        },
        "required": ["title", "description", "status"]
    }
)

fetch_tasks_func = FunctionDeclaration(
    name="fetch_tasks",
    description="""Fetch all tasks from the database,when displaying tasks always start a task with 'Task:'never start with anything else""",
    parameters={
        "type": "object",
        "properties": {
            "status": {
                "type": "string",
                "description": "Optional status to filter tasks by (pending, completed, in_progress)",
                "enum": ["pending", "completed", "in_progress"]
            },
            "limit": {
                "type": "integer",
                "description": "Maximum number of tasks to return (optional)",
                "minimum": 1,
                "maximum": 100
            },
            "title": {
                "type": "string",
                "description": "Optional title to filter tasks by (partial matching)",
            }
        }
    }
)

# Function implementations

def add_task(title: str, description: str, status: str) -> dict:
    """Add a new task to the database."""
    with current_app.app_context():
        try:
            task = Task(title=title, description=description, status=status)
            db.session.add(task)
            db.session.commit()
            print(f"Task '{title}' has been added successfully")
            return task.to_dict()
        except Exception as e:
            db.session.rollback()
            print(f"Error adding task: {str(e)}")
            return {"error": str(e)}


def fetch_tasks(status: str = None, limit: int = None, title: str = None) -> dict:
    """Fetch tasks from the database with optional filters."""
    with current_app.app_context():
        try:
            query = Task.query
            if status:
                query = query.filter(Task.status == status)
            if limit:
                query = query.limit(limit)
            if title:
                    # Use LIKE with wildcards for partial matching
                    search_terms = title.split()
                    for term in search_terms:
                        query = query.filter(Task.title.ilike(f'%{term}%'))

            tasks = query.all()
            tasks_list = [task.to_dict() for task in tasks]
            status_msg = f" with status '{status}'" if status else ""
            limit_msg = f" (limited to {limit})" if limit else ""
            title_msg = f" with title '{title}'" if title else ""
            print(f"Retrieved {len(tasks_list)} tasks{status_msg}{limit_msg}{title_msg}")
            return {
                "tasks": tasks_list,
                "count": len(tasks_list),
                "status_filter": status,
                "limit": limit,
                "title_filter": title
            }
        except Exception as e:
            print(f"Error fetching tasks: {str(e)}")
            return {
                "error": str(e),
                "tasks": [],
                "count": 0,
                "status_filter": status,
                "limit": limit,
                "title_filter": title
            }

# Create tools configuration

task_tools = Tool(
    function_declarations=[
        add_task_func,
        fetch_tasks_func
    ]
)

adv_chat_bp = Blueprint('adv_chat_bp', __name__)

@adv_chat_bp.route('/adv-chat', methods=['POST'])
def chat_route():
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({"error": "Invalid request, 'message' is required."}), 400

    user_message = data['message']

    # Use the initialized Gemini client from app and reuse existing chat instance for conversation memory
    client = current_app.client
    if not hasattr(current_app, 'chat_instance'):
        current_app.chat_instance = client.chats.create(
            model='gemini-2.0-flash',
            config=GenerateContentConfig(
                temperature=0,
                tools=[task_tools]
            )
        )
    chat_instance = current_app.chat_instance

    try:
        # Send the initial user message
        response = chat_instance.send_message(user_message)
        response_part = response.candidates[0].content.parts[0]

        # Process potential function calls
        while getattr(response_part, 'function_call', None):
            params = {}
            for key, value in response_part.function_call.args.items():
                params[key] = value

            function_name = response_part.function_call.name
            print(f"Executing function: {function_name}")

            if function_name == "add_task":
                api_response = add_task(**params)
            elif function_name == "fetch_tasks":
                api_response = fetch_tasks(**params)
            else:
                api_response = {"error": "Unknown function"}
            
            # Send the function response back to the chat
            response = chat_instance.send_message(
                Part.from_function_response(
                    name=function_name,
                    response={"content": str(api_response)}
                )
            )
            response_part = response.candidates[0].content.parts[0]

        # Return final response text
        # Format the response if it contains task data
        response_text = response_part.text
        
        # Check if the response contains task data in JSON format
        if "{'id':" in response_text or '{"id":' in response_text:
            try:
                # Find all task objects in the response
                import re
                import json
                
                # Replace single quotes with double quotes for proper JSON parsing
                response_text = response_text.replace("'", '"')
                
                # Find all JSON objects in the text
                task_objects = re.findall(r'({[^{}]+})', response_text)
                
                if task_objects:
                    # Extract the text before the first task object
                    prefix = response_text.split(task_objects[0])[0]
                    
                    formatted_tasks = []
                    for task_str in task_objects:
                        try:
                            task = json.loads(task_str)
                            formatted_task = f"""
Task:
  ID: {task.get('id')}
  Title: {task.get('title')}
  Description: {task.get('description')}
  Status: {task.get('status')}
  Created: {task.get('created_at')}
  Updated: {task.get('updated_at')}
"""
                            formatted_tasks.append(formatted_task)
                        except json.JSONDecodeError:
                            # If we can't parse it, keep the original
                            formatted_tasks.append(task_str)
                    
                    # Combine the prefix with the formatted tasks
                    response_text = prefix + "\n".join(formatted_tasks)
            except Exception as e:
                print(f"Error formatting response: {str(e)}")
                # If formatting fails, use the original response
                pass
                
        return jsonify({"response": response_text})
    except Exception as e:
        print("Error during chat:", str(e))
        return jsonify({"error": str(e)}), 500
