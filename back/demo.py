# pylint: disable=broad-exception-caught,invalid-name

from google import genai
from dotenv import load_dotenv
from google.genai.types import FunctionDeclaration, GenerateContentConfig, Part, Tool
import os
from models import db, Task
from app import app

# Load environment variables
load_dotenv()

# Function Declarations
add_task_func = FunctionDeclaration(
    name="add_task",
    description="Add a new task to the database",
    parameters={
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "The title of the task"
            },
            "description": {
                "type": "string",
                "description": "A detailed description of the task"
            },
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
    description="Fetch all tasks from the database",
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
            }
        }
    }
)

# Function implementations
def add_task(title: str, description: str, status: str) -> dict:
    """Add a new task to the database."""
    with app.app_context():
        try:
            task = Task(
                title=title,
                description=description,
                status=status
            )
            db.session.add(task)
            db.session.commit()
            print(f"Task '{title}' has been added successfully")
            return task.to_dict()
        except Exception as e:
            db.session.rollback()
            print(f"Error adding task: {str(e)}")
            return {"error": str(e)}

def fetch_tasks(status: str = None, limit: int = None) -> dict:
    """Fetch tasks from the database with optional filters."""
    with app.app_context():
        try:
            query = Task.query
            
            # Apply status filter if provided
            if status:
                query = query.filter(Task.status == status)
            
            # Apply limit if provided
            if limit:
                query = query.limit(limit)
            
            tasks = query.all()
            tasks_list = [task.to_dict() for task in tasks]
            
            status_msg = f" with status '{status}'" if status else ""
            limit_msg = f" (limited to {limit})" if limit else ""
            print(f"Retrieved {len(tasks_list)} tasks{status_msg}{limit_msg}")
            
            return {
                "tasks": tasks_list,
                "count": len(tasks_list),
                "status_filter": status,
                "limit": limit
            }
        except Exception as e:
            print(f"Error fetching tasks: {str(e)}")
            return {
                "error": str(e),
                "tasks": [],
                "count": 0
            }

# Create tools configuration
task_tools = Tool(
    function_declarations=[
        add_task_func,
        fetch_tasks_func,
    ]
)

def main():
    # Initialize Gemini client
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
    
    # Create chat interface
    chat = client.chats.create(
        model='gemini-2.0-flash', 
        config=GenerateContentConfig(
            temperature=0,
            tools=[task_tools]
        )
    )
    
    print("\nWelcome to Task Management Console!")
    print("Type 'exit' to quit the application")
    print("\nExample commands:")
    print("- Show me all my tasks")
    print("- Add a new task called 'Meeting prep' with description 'Prepare agenda for team meeting' and status pending")
    print("- What tasks do I have pending?\n")

    chat_history = []
    
    while True:
        try:
            # Get user input
            user_input = input("\nEnter your request: ")
            if user_input.lower() == 'exit':
                break

            # Add to chat history
            chat_history.append({"role": "user", "content": user_input})
            print("\nProcessing your request...")

            # Send message and handle function calling
            response = chat.send_message(user_input)
            response = response.candidates[0].content.parts[0]

            function_calling_in_process = True
            while function_calling_in_process:
                try:
                    # Extract function call parameters
                    params = {}
                    for key, value in response.function_call.args.items():
                        params[key] = value

                    print(f"\nExecuting function: {response.function_call.name}")
                    
                    # Execute the appropriate function
                    if response.function_call.name == "add_task":
                        api_response = add_task(**params)
                    elif response.function_call.name == "fetch_tasks":
                        api_response = fetch_tasks(**params)
                    
                    # Send the function response back to the model
                    response = chat.send_message(
                        Part.from_function_response(
                            name=response.function_call.name,
                            response={"content": str(api_response)}
                        )
                    )
                    response = response.candidates[0].content.parts[0]

                except AttributeError:
                    function_calling_in_process = False

            # Print the final response
            print("\nResponse:", response.text)
            chat_history.append({"role": "assistant", "content": response.text})

        except Exception as e:
            print(f"\nError: {str(e)}")
            print("Please try again with a different request.")

if __name__ == "__main__":
    main()
