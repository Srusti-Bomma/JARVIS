import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from Jarvis import process_command

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def index():
    return render_template("jarvisUi.html")

@socketio.on("user_input")
def handle_input(data):
    user_text = data.get("text", "")
    emit("jarvis_thinking", {})
    response = process_command(user_text, speak_response=False)  # ✅ Browser handles TTS
    emit("jarvis_response", {"text": response})

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)