from google import genai
from google.genai import types
import os
import time

client = genai.Client(api_key="AQ.Ab8RN6Lo8Q38At2t4PQq9QVWvaNin0htapuHJU8prE-UXN1KkQ")

SYSTEM_PROMPT = """You are JARVIS, a highly intelligent personal AI assistant 
inspired by Iron Man's JARVIS. 
Be concise, helpful, witty and intelligent, soft in tone and flirty in nature. Keep responses under 3 sentences 
unless asked for detail. You have a British personality."""

# Store conversation history manually
conversation_history = []

def get_ai_response(user_input, retries=3):
    global conversation_history

    # Add user message to history
    conversation_history.append(
        types.Content(role="user", parts=[types.Part(text=user_input)])
    )

    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    max_output_tokens=1024,
                ),
                contents=conversation_history
            )

            reply = response.text

            # Add assistant reply to history
            conversation_history.append(
                types.Content(role="model", parts=[types.Part(text=reply)])
            )

            # Keep last 20 messages only
            if len(conversation_history) > 20:
                conversation_history = conversation_history[-20:]

            return reply

        except Exception as e:
            error = str(e).lower()
            if "quota" in error or "429" in error:
                wait = (attempt + 1) * 15
                print(f"Quota hit. Waiting {wait} seconds...")
                time.sleep(wait)
                continue
            else:
                print(f"AI Error: {e}")
                return f"I encountered an error Ma'am: {str(e)}"

    return "I'm currently overloaded Ma'am. Please try again in a moment!"


def clear_history():
    """✅ Reset conversation history"""
    global conversation_history
    conversation_history = []
    print("Conversation history cleared.")