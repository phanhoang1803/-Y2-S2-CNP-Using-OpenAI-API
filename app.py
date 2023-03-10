from flask import Flask, jsonify, request
from flask_cors import CORS
from pydub import AudioSegment
import io
import openai
import os
app = Flask(__name__)
CORS(app)

api_key = "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"
openai.api_key = api_key

def send_message(message_log):
    # Use OpenAI's ChatCompletion API to get the chatbot's response
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",  
        messages=message_log,   # The conversation history up to this point, as a list of dictionaries
        max_tokens=2048,        # The maximum number of tokens (words or subwords) in the generated response
        stop=None,              # The stopping sequence for the generated response, if any (not used here)
        temperature=0.7,        # The "creativity" of the generated response (higher temperature = more creative)
    )

    # Find the first response from the chatbot that has text in it (some responses may not have text)
    for choice in response.choices:
        if "text" in choice:
            return choice.text

    # If no response with text is found, return the first response's content (which may be empty)
    return response.choices[0].message.content

@app.route("/api/get_response", methods = ["POST"])
def get_response():
    # Get message from request
    data = request.get_json()
    message_log = data["message"]

    # Call API and receive the result
    response = send_message(message_log)

    message_log =[]

    # Update the conversation history
    message_log.append({"role": "assistant", "content": response})

    # Return the result by js
    return jsonify({"message": message_log, "result": response})

# def convert_speech_to_text():
    
@app.route("/get_whisper", methods=["POST"])
def get_whisper():
    # Get the audio file from the POST request
    audio_file = request.files["audio"]
    
    file_name = "F:\sadassa321sadas.webm"
    audio_file.save(file_name)

    # Convert speech to text
    with open(file_name, "rb") as audio_file:
        transcript = openai.Audio.transcribe(
            model="whisper-1",
            file=audio_file,
            mime_type="audio/webm"
        )
    
    # # Extract the text from the transcript
    text = transcript["text"]

    # Get the message from the POST request

    message_log = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": text}
    ]

    # Send the message to the server
    response = send_message(message_log)

    # Update the conversation history
    message_log.append({"role": "assistant", "content": response})

    return jsonify({"result": response})
    

if __name__ == "__main__":
    app.run()
