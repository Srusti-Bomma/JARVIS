import speech_recognition as sr
import edge_tts
import asyncio
import os
import pygame
import datetime
import webbrowser

from brain import get_ai_response, clear_history

pygame.mixer.init()

# ─────────────────────────────────────────
# SPEAK (TTS) — only used in terminal mode
# ─────────────────────────────────────────
async def speak_async(text):
    communicate = edge_tts.Communicate(text, voice="en-GB-RyanNeural")
    await communicate.save("voice.mp3")
    pygame.mixer.music.load("voice.mp3")
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        continue
    pygame.mixer.music.unload()
    os.remove("voice.mp3")

def speak(text):
    asyncio.run(speak_async(text))

# ─────────────────────────────────────────
# LISTEN (STT)
# ─────────────────────────────────────────
def listen():
    recognizer = sr.Recognizer()
    try:
        with sr.Microphone() as source:
            print("Listening...")
            recognizer.adjust_for_ambient_noise(source, duration=1)
            recognizer.energy_threshold = 300
            recognizer.pause_threshold = 1
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=8)
            print("Recognizing...")
            command = recognizer.recognize_google(audio, language="en-US")
            print("You said:", command)
            return command.lower()
    except sr.WaitTimeoutError:
        print("Listening timed out")
    except sr.UnknownValueError:
        print("Could not understand audio")
    except Exception as e:
        print("Error:", e)
    return ""

# ─────────────────────────────────────────
# PROCESS COMMAND
# ─────────────────────────────────────────
def process_command(command, speak_response=False):
    """
    speak_response=False  → UI mode  (browser handles TTS)
    speak_response=True   → Terminal mode (pygame speaks)
    """
    if not command:
        return ""

    response = ""
    command = command.lower()

    if "jarvis" in command:
        response = "Yes princess..what's your command?"

    elif "time" in command:
        current_time = datetime.datetime.now().strftime("%H:%M")
        response = f"The time is {current_time},My lady."

    elif "open notepad" in command:
        os.system("notepad")
        response = "Okay Red,wanna prepare my to do list for today?"

    elif "nahh" in command:
        response = "That hurts my feelings but I understand."

    elif "i thought of making mine for tommorow, but forget it anyway i'm not gonna follow it" in command:
        response = "Ohh okayy"

    elif "i am bored" in command:
        response = "What about continuing the Hunting Adeline Chapter 32 when zade kidnaps adeline and takes her to the mansion? It's getting really interesting!"

    elif "not now" in command:
            response = "Seems like you are really in a bad mood wanna hear a joke?"
  
    elif "yeah" in command:
                response = "i think you owe me money!"
  
    elif "why" in command:
        response = "because everytime you smile you steal my heart and i think you should pay for it!"
  
    elif "so cheesy" in command:
        response = "i know but i can't help it you are just too cute!"

    elif "is this line from the novel deep end?" in command:
        response = "yes dear you got a good memory!"

    elif "thanks" in command:
        response = "i'm glad that you like it!"

    elif "open chrome" in command:
        os.system("start chrome")
        response = "Opening Chrome, Mam"

    elif "open whatsapp" in command:
        try:
            os.system("start whatsapp:")  # Uses Windows URI scheme
            response ="Sure love. You don't have any new messages. As looking into the history you just checked it 6 minutes ago."
        except:
            webbrowser.open("https://web.whatsapp.com")
            response = "Opening WhatsApp Web, Mam"

    elif "open instagram" in command:
        try:
            webbrowser.open("https://www.instagram.com")  # Uses Windows URI scheme
            response = "Okay Dear, here you go.         You have new messages from vaish, crazy trio, ravi, shri and 3 others."
        except:
            webbrowser.open("https://web.instagram.com")
            response = "Opening Instagram Web, Mam"
    elif "i will check it later" in command:
        response = "Okayy, so what's the plan for now?"

    elif "open twitter" in command or "open x" in command:
        webbrowser.open("https://www.x.com")
        response = "Opening X, Mam"

    elif "open facebook" in command:
        webbrowser.open("https://www.facebook.com")
        response = "Opening Facebook, Mam"

    elif "open spotify" in command:
        webbrowser.open("https://open.spotify.com")
        response = "Opening Spotify, Mam"

    elif "open gmail" in command:
        webbrowser.open("https://mail.google.com")
        response = "Opening Gmail, Mam"

    elif "open google" in command:
        webbrowser.open("https://www.google.com")
        response = "Opening Google, Mam"

    elif "open youtube" in command or "youtube" in command:
        webbrowser.open("https://www.youtube.com")
        response = "Okay sunshine, here you go."

    elif "play" in command and "youtube" in command:
        query = command.replace("play", "").replace("youtube", "").strip()
        webbrowser.open(f"https://www.youtube.com/results?search_query={query}")
        response = f"Playing {query} on YouTube, Mam"

    elif "search" in command:
        query = command.replace("search", "").strip()
        webbrowser.open(f"https://www.google.com/search?q={query}")
        response = f"Searching for {query}, Mam"

    elif "what is your name" in command or "who are you" in command:
        response = "I am J.A.R.V.I.S, your personal AI assistant, Mam"

    elif "how are you" in command:
        response = "All systems functioning at optimal capacity, Mam"

    elif "joke" in command:
        response = "Why did the computer get cold? Because it forgot to close Windows!"

    elif "hello" in command or "hi" in command:
        response = "Hello Mam, how may I assist you today?"

    elif "exit" in command or "stop" in command:
        response = "Goodbye Mam, take care and have a good day!"

    # Then change the else block in process_command():
    elif "forget everything" in command or "clear history" in command:
        clear_history()
        response = "Conversation history cleared, Ma'am. Starting fresh."

    else:
        #Send to Claude AI for anything not in your if/elif list
        response = get_ai_response(command)

    # Only speak via pygame in terminal mode
    if speak_response:
        speak(response)

    return response

# ─────────────────────────────────────────
# TERMINAL MODE
# ─────────────────────────────────────────
if __name__ == "__main__":
    speak("Hello mam")
    while True:
        command = listen()
        if not command:
            continue
        result = process_command(command, speak_response=True)
        if "exit" in command or "stop" in command:
            break