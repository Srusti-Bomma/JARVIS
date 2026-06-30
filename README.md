# J.A.R.V.I.S — Personal AI Voice Assistant

> A web-based AI voice assistant inspired by Iron Man's JARVIS. Speak to it, and it responds with a British accent, opens apps, searches the web, and holds intelligent conversations powered by Google Gemini.

---

> JARVIS runs in your browser at `http://127.0.0.1:5000` — speak via your microphone and get real-time voice responses.

---

## Features

| Feature | Description |
|---|---|
| Voice Input | Speak commands via browser microphone (Web Speech API) |
| Voice Output | JARVIS responds in a British male voice (Edge TTS — Ryan Neural) |
| AI Conversations | Powered by **Google Gemini 2.0 Flash** for intelligent replies |
| Memory | Retains last 20 messages of conversation history per session |
| Open Websites | Opens WhatsApp, Instagram, YouTube, Spotify, Gmail, Google, Chrome & more |
| Web Search | Searches Google or plays videos on YouTube by voice |
| Time Awareness | Tells the current time on command |
| App Control | Opens desktop apps like Notepad via voice |
| Real-time Comms | Frontend and backend communicate via **WebSockets** (Flask-SocketIO) |
| Clear History | Say *"forget everything"* to reset conversation memory |

---

## Tech Stack

### Backend
- **Python 3.11**
- **Flask** — Web framework
- **Flask-SocketIO** — Real-time WebSocket communication
- **Google Gemini 2.0 Flash** (`google-genai`) — AI brain for open-ended conversations
- **Edge TTS** (`edge-tts`) — Text-to-speech with British neural voice
- **SpeechRecognition** (`speech_recognition`) — Microphone input in terminal mode
- **Pygame** — Audio playback in terminal mode
- **Webbrowser / OS** — Opening apps and websites

### Frontend
- **HTML5** — UI structure (`templates/jarvisUi.html`)
- **CSS3** — Custom styling (`static/Jarvis_ui.css`)
- **Vanilla JavaScript** — UI logic & WebSocket client (`static/jarvis_ui.js`)
- **Web Speech API** — Browser-native voice input & text-to-speech

### Communication
- **WebSockets** via Flask-SocketIO — instant two-way messaging between browser and Python backend

---

## Project Structure :-

```
JARVIS/
├── app.py                  # Flask app + WebSocket server (entry point)
├── Jarvis.py               # Command processor + TTS + STT logic
├── brain.py                # Google Gemini AI integration + conversation memory
├── templates/
│   └── jarvisUi.html       # Frontend UI
├── static/
│   ├── Jarvis_ui.css       # Styling
│   └── jarvis_ui.js        # Frontend WebSocket + Web Speech API logic
├── .gitignore
├── requirements.txt
└── README.md
```

---

## Setup & Installation

### Prerequisites
- Python 3.11
- Google Chrome (for mic access)
- A **Google Gemini API key** from [aistudio.google.com](https://aistudio.google.com)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/jarvis.git
cd jarvis
```

### 2. Create & Activate Virtual Environment

```bash
# Create virtual environment
python -m venv venv311

# Activate (Windows)
venv311\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install flask flask-socketio edge-tts pygame SpeechRecognition google-genai
```

### 4. Set Your API Key

Create a `.env` file in the project root (never commit this):

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Then make sure `brain.py` loads it via environment variable:

```python
import os
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
```

### 5. Run the App

```bash
python app.py
```

Then open Chrome and go to:
```
http://127.0.0.1:5000
```

---

## Allow Microphone in Chrome

JARVIS needs microphone permission to hear you:

**Option A:** Click the lock icon in the Chrome address bar → set **Microphone** to **Allow** → refresh the page.

**Option B:** Go to `chrome://settings/content/microphone` and add `http://127.0.0.1:5000` under **Allowed**.

---

## How It Works

```
You speak
    │
    ▼
Browser Mic (Web Speech API)
    │  captures voice → converts to text
    ▼
JavaScript (jarvis_ui.js)
    │  sends text over WebSocket
    ▼
Flask-SocketIO (app.py)
    │  receives text → calls process_command()
    ▼
Jarvis.py — Command Processor
    │
    ├── Known command? → Direct response (open app, tell time, etc.)
    │
    └── Unknown? → brain.py → Google Gemini AI → intelligent reply
    │
    ▼
Response sent back over WebSocket
    │
    ▼
Browser speaks the response (Web Speech API TTS)
```

---

## Two Modes

| Mode | How to run | Voice Input | Voice Output |
|---|---|---|---|
| **Browser Mode** (default) | `python app.py` → open Chrome | Web Speech API (browser mic) | Web Speech API (browser TTS) |
| **Terminal Mode** | `python Jarvis.py` | SpeechRecognition (system mic) | Edge TTS via Pygame |

---

## Security Notes

- **Never commit API keys** — store them in a `.env` file
- Add `.env` to `.gitignore`
- Regenerate any keys that were accidentally exposed
