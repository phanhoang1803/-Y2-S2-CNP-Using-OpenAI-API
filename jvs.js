var voice_output = true;

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

var message_log = [
	{ "role": "system", "content": "You are a helpful assistant." },
]

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

function response(user_input) {
	message_log.push({ "role": "user", "content": user_input });

	$.ajax({
		url: "http://localhost:5000/api/get_response",
		type: "POST",
		data: JSON.stringify({ "message": message_log }),
		contentType: "application/json",
		success: function (response) {
			// Update message_log
			message_log = response.message;

			// Print the response into the web
			return_response(response.result);
		},
		error: function () {
			return_response("This model's maximum context length is 4096 tokens. Please keep your questions short and concise. Or please provide valid api-key.");
			console.log('Error maximum or invalid api-key');
		}
	});
}

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

function uploadFile(file) {
	let formData = new FormData();
	formData.append('audio', file);


	$.ajax({
		url: "http://localhost:5000/get_whisper",
		type: "POST",
		data: formData,
		processData: false,
		contentType: false,
		success: function (response) {
			// Print the text of the recent audio
			document.getElementById("chatLog").innerHTML +=
			"<div class=\"message\">"
			+ "<div class=\"user_logo\">  <img src=\"USER_Logo.png\" alt=\"User\" width=\"30\" height=\"30\">  </div>"
			+ "<div class=\"user_text\"> Text of your audio: " + response.text_of_speech + "</div>"
			+ "</div>";

			// Print GPT's response.
			return_response(response.result);
		},
		error: function () {
			console.log('Cannot access get_whisper api.');
		}
	});
}