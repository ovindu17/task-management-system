from flask import Blueprint, jsonify, request, Response
from google import genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_input = data.get('message')
    if not user_input:
        return jsonify({'error': 'No message provided'}), 400

    def generate():
        try:
            client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
            response = client.models.generate_content_stream(
                model='gemini-2.0-flash',
                contents=[user_input]
            )
            
            for chunk in response:
                if chunk.text:
                    # Format the data as a Server-Sent Event
                    yield f"data: {chunk.text}\n\n"
                    
        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')