# Task Management System

A full-stack task management application with a React frontend and Flask backend. This application allows users to manage tasks, with features powered by Google's Generative AI.

## Project Structure

The project is divided into two main parts:

- **front/**: React frontend application
- **back/**: Flask backend API

## Features

- Task creation, editing, and deletion
- Task categorization and prioritization
- AI-powered task suggestions and assistance
- Responsive UI built with React and Tailwind CSS

## Technologies Used

### Frontend
- React 18
- React Router
- Axios for API requests
- Tailwind CSS for styling
- React Markdown for rendering markdown content

### Backend
- Flask 3.0.0
- Flask-CORS for cross-origin requests
- Flask-SQLAlchemy for database ORM
- PostgreSQL database
- Google Generative AI integration

## Setup and Installation

### Prerequisites
- Node.js and npm
- Python 3.8+
- PostgreSQL database

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd back
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost/taskmanagement
   GOOGLE_API_KEY=your_google_api_key
   PORT=5000
   ```

5. Run the application:
   ```
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd front
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## API Endpoints

- `GET /tasks`: Get all tasks
- `POST /tasks`: Create a new task
- `GET /tasks/<id>`: Get a specific task
- `PUT /tasks/<id>`: Update a task
- `DELETE /tasks/<id>`: Delete a task
- `GET /health`: Health check endpoint

## AI Integration

This project uses Google's Generative AI for:
- Task suggestions
- Natural language processing of task descriptions
- Advanced chat functionality for task management

## Development

To add sample tasks to the database, run:
```
python add_sample_tasks.py
```

## License

This project is licensed under the MIT License. 