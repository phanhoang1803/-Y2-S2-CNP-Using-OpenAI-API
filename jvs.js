var voice_output = true;

var message_log = [
	{ "role": "system", "content": "You are a helpful assistant." },
]

// Takes in a string then outputs the voice of that string
function convert_text_to_speech(messageInput){
	// Check if Web Speech API is available in the browser
	if ('speechSynthesis' in window) {
		const message = messageInput;
		const utterance = new SpeechSynthesisUtterance(message);
		speechSynthesis.speak(utterance);
		messageInput.value = '';
	} else 
		console.error('Web Speech API is not supported in this browser.');
}

// Takes in a string then prints the string according to the selected method
function return_response(result) {
	// Set output method
	if (document.getElementById("output-method").value == "text")
		voice_output = false;
	else
		voice_output = true;

	// Print the chatbot response into the web
	document.getElementById("chatLog").innerHTML +=
		"<div class=\"message\">"
		+ "<div class=\"bot_logo\">  <img src=\"ABC_Logo.svg\" alt=\"Bot\" width=\"30\" height=\"30\">  </div>"
		+ "<div class=\"bot_text\">" + result + "</div>"
		+ "</div>";

	// If the output is audio then play the audio
	if (voice_output)
		convert_text_to_speech(result);
}

// This function takes in a user input message as a parameter, 
// adds it to a conversation log object (a list of dictionaries with the role and content of each message), 
// and sends a POST request to url with the conversation log as the request data in JSON format.

// If the request is successful, 
// the function updates the conversation log with the response received from the API 
// and prints the response onto the web page by calling the return_response() function.

// If the request fails, the function prints an error message to the web page 
// and logs an error message to the console.
let isWaiting = false;
function response(user_input) {
	message_log.push({ "role": "user", "content": user_input });

	// Show waiting dot
	if (!isWaiting) {
		document.getElementById("wait-dots-frame").style.display = "block";
		isWaiting = true;
	}

	$.ajax({
		url: "http://localhost:5000/api/get_response",
		type: "POST",
		data: JSON.stringify({ "message": message_log }),
		contentType: "application/json",
		success: function (response) {
			// Update message_log
			message_log = response.message;

			// Hide waiting dot
			if (isWaiting) {
				document.getElementById("wait-dots-frame").style.display = "none";
				isWaiting = false;
			}

			// Print the response into the web
			return_response(response.result);
		},
		error: function () {
			return_response("This model's maximum context length is 4096 tokens. Please keep your questions short and concise. Or please provide valid api-key.");
			// Clear the conversation history
			message_log = [
				{ "role": "system", "content": "You are a helpful assistant." },
			]
			console.log('Error maximum or invalid api-key');

			// Hide waiting dot
			if (isWaiting) {
				document.getElementById("wait-dots-frame").style.display = "none";
				isWaiting = false;
			}
		}
	});
}

// Gets the input message from the HTML element with the ID "get.message" 
// then it prints the user's message onto the website.

// After that, the function calls "response" and passes the user's message as an argument
// in order to print the response.
function sendMessage() {
	var messageInput = document.getElementById("get.message");
	var messageValue = messageInput.value;
	messageInput.value = "";

	// Print the message into the web
	document.getElementById("chatLog").innerHTML +=
		"<div class=\"message\">"
		+ "<div class=\"user_logo\">  <img src=\"USER_Logo.png\" alt=\"User\" width=\"30\" height=\"30\">  </div>"
		+ "<div class=\"user_text\">" + messageValue + "</div>"
		+ "</div>";

	// Get and print the response
	response(messageValue);
}

// --------------------------------------- //

let recorder;
let isRecording = false;

// This function determines the state and content of the recording display button or not
function toggleRecording() {
	recordButton = document.getElementById('record-button');
	if (isRecording) {
		stopRecording();
		recordButton.innerHTML = 'Start Recording';
	} else {
		startRecording();
		recordButton.innerHTML = 'Stop And Send';
	}
	isRecording = !isRecording;
}


function startRecording() {
	// Show recording effect
	document.getElementById('recording-indicator').style.display = 'block';

	// Start recoding
	navigator.mediaDevices.getUserMedia({ audio: true })
		.then(function (stream) {
			recorder = new RecordRTC(stream, {
				type: 'audio',
				mimeType: 'audio/webm'
			});
			recorder.startRecording();
		});
}

// Stop recording and put the recording file in the uploadFile function to call the API and get the answer
function stopRecording() {
	// Stop recording effect
	document.getElementById('recording-indicator').style.display = 'none';

	recorder.stopRecording(function () {
		let blob = recorder.getBlob();

		// Create an audio element and play the recording
		let audio = document.createElement('audio');
		audio.src = URL.createObjectURL(blob);
		audio.controls = true;

		document.getElementById("chatLog").innerHTML +=
			"<div class=\"message\">" +
			"<div class=\"user_logo\"><img src=\"USER_Logo.png\" alt=\"User\" width=\"30\" height=\"30\"></div>" +
			"<div class=\"audio-player user_text\">" + audio.outerHTML + "</div>" +
			"</div>";

		// Use the api to convert audio to text to get the answer
		uploadFile(blob)
	});
}

// Send recording file by Ajax
// If success, it prints the text and the response of the audio
// else, it prints error to the console 
function uploadFile(file) {
	let formData = new FormData();
	formData.append('audio', file);

	// Show waiting dot
	if (!isWaiting) {
		document.getElementById("wait-dots-frame").style.display = "block";
		isWaiting = true;
	}

	$.ajax({
		url: "http://localhost:5000/get_whisper",
		type: "POST",
		data: formData,
		processData: false,
		contentType: false,
		success: function (response) {
			// Print the text of the recent audio
			
			if (isWaiting) {
				document.getElementById("wait-dots-frame").style.display = "none";
				isWaiting = true;
			}

			document.getElementById("chatLog").innerHTML +=
			"<div class=\"message\">"
			+ "<div class=\"user_logo\">  <img src=\"USER_Logo.png\" alt=\"User\" width=\"30\" height=\"30\">  </div>"
			+ "<div class=\"user_text\"> Text of your audio: " + response.text_of_speech + "</div>"
			+ "</div>";

			// Print GPT's response.
			return_response(response.result);
		},
		error: function () {
			// Hide waiting dot
			if (isWaiting) {
				document.getElementById("wait-dots-frame").style.display = "none";
				isWaiting = false;
			}
			console.log('Cannot access get_whisper api.');
		}
	});
}