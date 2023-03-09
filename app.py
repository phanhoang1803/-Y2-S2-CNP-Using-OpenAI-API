from flask import Flask, jsonify, request
from flask_cors import CORS
import openai

app = Flask(__name__)
CORS(app)

def send_message(message_log):
    api_key = "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"
    openai.api_key = api_key
    # Use OpenAI's ChatCompletion API to get the chatbot's response
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",  
        messages=message_log,   # The conversation history up to this point, as a list of dictionaries
        max_tokens=3800,        # The maximum number of tokens (words or subwords) in the generated response
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

    # Update the conversation history
    message_log.append({"role": "assistant", "content": response})

    # Return the result by js
    return jsonify({"message": message_log, "result": response})

if __name__ == "__main__":
    app.run()
