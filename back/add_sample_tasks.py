from app import app
from models import db, Task

def add_sample_tasks():
    # Sample tasks data 20 tasks
    tasks = [
        
        {
            'title': 'Mobile Responsiveness',
            'description': 'Ensure the application works well on mobile devices and tablets',
            'status': 'in_progress'
        },
        {
            'title': 'Performance Optimization',
            'description': 'Improve application loading times and overall performance',
            'status': 'pending'
        },
        {
            'title': 'User Onboarding Flow',
            'description': 'Create a smooth onboarding experience for new users',
            'status': 'pending'
        },
        {
            'title': 'Email Notification System',
            'description': 'Implement email notifications for task assignments and deadlines',
            'status': 'completed'
        },
        {
            'title': 'Data Export Feature',
            'description': 'Allow users to export their tasks in CSV and PDF formats',
            'status': 'in_progress'
        },
        {
            'title': 'Dark Mode Implementation',
            'description': 'Add dark mode theme option for better user experience',
            'status': 'pending'
        },
        {
            'title': 'Task Filtering and Sorting',
            'description': 'Implement advanced filtering and sorting options for tasks',
            'status': 'completed'
        },
        {
            'title': 'User Profile Management',
            'description': 'Allow users to update their profile information and preferences',
            'status': 'in_progress'
        },
        {
            'title': 'Integration with Calendar Apps',
            'description': 'Add functionality to sync tasks with Google Calendar and other apps',
            'status': 'pending'
        },
        {
            'title': 'Accessibility Improvements',
            'description': 'Ensure the application meets WCAG 2.1 accessibility standards',
            'status': 'pending'
        }
    ]

    # Add tasks to database
    with app.app_context():
        for task_data in tasks:
            task = Task(
                title=task_data['title'],
                description=task_data['description'],
                status=task_data['status']
            )
            db.session.add(task)
        
        # Commit all tasks
        try:
            db.session.commit()
            print('Successfully added sample tasks!')
        except Exception as e:
            db.session.rollback()
            print(f'Error adding tasks: {str(e)}')

if __name__ == '__main__':
    add_sample_tasks()