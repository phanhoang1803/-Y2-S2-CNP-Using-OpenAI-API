from flask import Flask, jsonify, request
from flask_cors import CORS
from pydub import AudioSegment
import openai
app = Flask(__name__)
CORS(app)

api_key = "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"
# api_key = "Your API-Key"
openai.api_key = api_key

# Get into a conversation, then use GPT-api to get the answer, return that answer
def send_message(message_log):
    # Use OpenAI's ChatCompletion API to get the chatbot's response
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",  
        messages=message_log,   # The conversation history up to this point, as a list of dictionaries
        max_tokens=3072,        # The maximum number of tokens (words or subwords) in the generated response
        stop=None,              # The stopping sequence for the generated response, if any (not used here)
        temperature=0.7,        # The "creativity" of the generated response (higher temperature = more creative)
    )

    # Find the first response from the chatbot that has text in it (some responses may not have text)
    for choice in response.choices:
        if "text" in choice:
            return choice.text

    # If no response with text is found, return the first response's content (which may be empty)
    return response.choices[0].message.content


# Receives a POST request with a JSON that contains a conversation history,
# uses send_message function to receiving a response.
# After that, return a JSON file containing the updated conversation history (message_log) and the response (result)
@app.route("/api/get_response", methods = ["POST"])
def get_response():
    # Get message from request
    data = request.get_json()
    message_log = data["message"]

    # Reduce tokens because this model only accept < 4096 tokens
    message_log=message_log[-2:]

    # Call API and receive the result
    response = send_message(message_log)

    # Update the conversation history
    message_log.append({"role": "assistant", "content": response})

    # Return the result
    return jsonify({"message": message_log, "result": response})


# Receives a POST request with a JSON that contains a audio file,
# convert audio file to text and use send_message function to receiving a response.
# After that, return a JSON file containing the response (result) and the text of audio file.
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
    
    # Extract the text from the transcript
    text = transcript["text"]

    # Set message's context
    message_log = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": text}
    ]

    # Send the message to the server and receive
    response = send_message(message_log)
    
    return jsonify({"result": response, "text_of_speech": text})
    

if __name__ == "__main__":
    app.run()
