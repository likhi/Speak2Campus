"""
voice_input.py - Voice Input Module for SPEAK2CAMPUS
Handles microphone input and speech-to-text conversion
"""

import speech_recognition as sr


def get_voice_input():
    """
    Capture voice input from microphone and convert to text
    Returns: tuple (success: bool, text: str or error_message: str)
    """
    # Initialize the recognizer
    recognizer = sr.Recognizer()
    
    # Use the default microphone as audio source
    with sr.Microphone() as source:
        print("\n🎤 Listening... (Speak now)")
        print("-" * 40)
        
        # Adjust for ambient noise (helps in noisy environments)
        recognizer.adjust_for_ambient_noise(source, duration=0.5)
        
        try:
            # Listen for audio input with timeout
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
            print("🔄 Processing your speech...")
            
            # Convert speech to text using Google's speech recognition
            text = recognizer.recognize_google(audio, language="en-IN")
            print(f"✓ You said: \"{text}\"")
            return True, text
            
        except sr.WaitTimeoutError:
            # No speech detected within timeout
            return False, "No speech detected. Please try again."
            
        except sr.UnknownValueError:
            # Speech was detected but couldn't be understood
            return False, "Sorry, I couldn't understand that. Please speak clearly."
            
        except sr.RequestError as e:
            # API request failed (usually network issue)
            return False, f"Speech recognition service unavailable. Error: {e}"
            
        except Exception as e:
            # Any other unexpected error
            return False, f"An error occurred: {str(e)}"


def get_text_input():
    """
    Fallback function to get text input from keyboard
    Used when microphone is not available
    Returns: str - user input text
    """
    print("\n⌨️  Type your query (or 'quit' to exit):")
    text = input(">>> ").strip()
    return text


def test_microphone():
    """
    Test if microphone is working properly
    Returns: bool - True if microphone is available
    """
    try:
        # Check if any microphone is available
        mic_list = sr.Microphone.list_microphone_names()
        if len(mic_list) > 0:
            print(f"✓ Found {len(mic_list)} microphone(s)")
            print(f"  Using: {mic_list[0]}")
            return True
        else:
            print("✗ No microphone found!")
            return False
    except Exception as e:
        print(f"✗ Microphone error: {e}")
        return False


if __name__ == "__main__":
    # Test the voice input module
    print("=" * 50)
    print("  SPEAK2CAMPUS - Voice Input Test")
    print("=" * 50)
    
    if test_microphone():
        print("\nTesting voice input...")
        success, result = get_voice_input()
        if success:
            print(f"\n✓ Voice input successful: {result}")
        else:
            print(f"\n✗ Voice input failed: {result}")
    else:
        print("\nFalling back to text input...")
        text = get_text_input()
        print(f"You typed: {text}")
