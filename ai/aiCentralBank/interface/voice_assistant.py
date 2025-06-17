# aiCentralBank/interface/voice_assistant.py

import queue
import threading
try:
    import speech_recognition as sr
    import pyttsx3
except ImportError:
    sr = None
    pyttsx3 = None

 """

    def __init__(self, nlp_callback):
        self.nlp_callback = nlp_callback  # Function that accepts (text) and returns a reply
        if sr and pyttsx3:
            self.recognizer = sr.Recognizer()
            self.engine = pyttsx3.init()
            self.is_active = False
        else:
            self.recognizer = None
            self.engine = None

    def listen_and_respond(self):
        if not self.recognizer:
            print("Install speech_recognition and pyttsx3 for voice capabilities.")
            return

        self.is_active = True
       :", e)
                    continue

# Example usage:
if __name__ == "__main__":
    def fake_nlp(text):
        return f"You said: {text}. (This is a test reply.)"
    va = VoiceCentralBankAssistant(fake_nlp)
    va.listen_and_respond()
