from google import genai
from dotenv import load_dotenv
from google.genai.types import FunctionDeclaration, GenerateContentConfig, Part, Tool

import os
from models import db, Task  # Add this import

load_dotenv()

def set_light_values(brightness: int, color_temp: str) -> dict[str, int | str]:
    """Set the brightness and color temperature of a room light. (mock API).

    Args:
        brightness: Light level from 0 to 100. Zero is off and 100 is full brightness
        color_temp: Color temperature of the light fixture, which can be `daylight`, `cool` or `warm`.

    Returns:
        A dictionary containing the set brightness and color temperature.
    """
    #print the brightness and color temperature
    print(f"Lights are now set to {brightness:.0%}")
    print(f"Color temperature is set to {color_temp}")
    return {
        "brightness": brightness,
        "colorTemperature": color_temp
    }

from app import app  # Import the Flask app

def add_task(title: str, description: str, status: str) -> dict[str, str]:
    """Add a new task to the database.

    Args:
        title: The title of the task
        description: A detailed description of the task
        status: The status of the task

    Returns:
        A dictionary containing the created task's details.
    """
    with app.app_context():  # Add application context
        try:
            # Create a new task instance
            task = Task(
                title=title,
                description=description,
                status=status
            )
            
            # Add to database
            db.session.add(task)
            db.session.commit()
            
            print(f"Task '{title}' has been added successfully")
            return task.to_dict()
        except Exception as e:
            db.session.rollback()
            print(f"Error adding task: {str(e)}")
            return {"error": str(e)}

def fetch_tasks( ) :
    """Fetch tasks from the database.

    Args:
        no args required

    Returns:
        A dictionary containing a list of tasks and their details.
    """
    with app.app_context():
        try:
            status: str = 'pending'
            # Build the query
            query = Task.query
            if status:
                query = query.filter(Task.status == status)
            
            # Execute query and get all tasks
            tasks = query.all()
            
            # Convert tasks to dictionary format
            tasks_list = [task.to_dict() for task in tasks]
            
            print(f"Retrieved {len(tasks_list)} tasks" + (f" with status '{status}'" if status else ""))
            return {
                "tasks": tasks_list,
                "count": len(tasks_list)
            }
        except Exception as e:
            print(f"Error fetching tasks: {str(e)}")
            return {
                "error": str(e),
                "tasks": [],
                "count": 0
            }



config = {
    'tools': [set_light_values, add_task, fetch_tasks],
}

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


# response = client.models.generate_content_stream(
#     model="gemini-2.0-flash",
#     contents=["Explain how AI works"])
# for chunk in response:
#     print(chunk.text, end="")



# Use the chat interface.
chat = client.chats.create(
    model='gemini-2.0-flash', 
    config=GenerateContentConfig(temperature=0, tools=[set_light_values, add_task, fetch_tasks]),
)

# Added continuous prompt to allow multi-turn conversation with history maintained:
while True:
    user_input = input("Enter your prompt (type 'exit' to quit): ")
    if user_input.strip().lower() == "exit":
        break
    response = chat.send_message(user_input)
    print(response.text)
