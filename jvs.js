var message_log = [
	{ "role": "system", "content": "You are a helpful assistant." },
]

function return_response(result) {
	// Add the response to the chat log
	document.getElementById("chatLog").innerHTML +=
		"<div class=\"message\">"
		+ "<div class=\"bot_logo\">  <img src=\"ABC_Logo.svg\" alt=\"Bot\" width=\"30\" height=\"30\">  </div>"
		+ "<div class=\"bot_text\">" + result + "</div>"
		+ "</div>";
}

function response(user_input) {
	message_log.push({ "role": "user", "content": user_input });
	// console.log(message_log);

	$.ajax({
		url: "http://localhost:5000/api/get_response",
		type: "POST",
		data: JSON.stringify({ "message": message_log }),
		contentType: "application/json",
		success: function (response) {
			// message_log = response.message;
			// return_response(response.message);
			// console.log(message_log);

			// $("#result").text(response.result);

			// Print the response into the web
			return_response(response.result);
		},
		error: function () {
			return_response("This model's maximum context length is 4096 tokens. Please keep your questions short and concise.");
			console.log('Error maximum');
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
	// Hiển thị hiệu ứng ghi âm
	document.getElementById('recording-indicator').style.display = 'block';

	let audioPlayer = document.getElementById('audio-player');
	audioPlayer.innerHTML = ''; // Xoá thanh phát âm thanh

	// Bắt đầu ghi âm
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
	recorder.stopRecording(function () {
		let blob = recorder.getBlob();

		// Ẩn hiệu ứng ghi âm
		document.getElementById('recording-indicator').style.display = 'none';

		// Create an audio element and play the recording
		let audio = document.createElement('audio');
		audio.src = URL.createObjectURL(blob);
		audio.controls = true;

		document.getElementById("chatLog").innerHTML +=
			"<div class=\"message\">" +
			"<div class=\"user_logo\"><img src=\"USER_Logo.png\" alt=\"User\" width=\"30\" height=\"30\"></div>" +
			"<div class=\"audio-player\">" + audio.outerHTML + "</div>" +
			"</div>";

		// Play the recent audio
		// audio.play();
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
			console.log('File uploaded successfully.');
			processResponse(response.result);
		},
		error: function () {
			console.log('Error uploading file.');
		}
	});
}

function processResponse(response) {
	// Do something with the response
	console.log(response);
	document.getElementById("chatLog").innerHTML +=
		"<div class=\"message\">"
		+ "<div class=\"bot_logo\">  <img src=\"ABC_Logo.svg\" alt=\"Bot\" width=\"30\" height=\"30\">  </div>"
		+ "<div class=\"bot_text\">" + response + "</div>"
		+ "</div>";
 }

//  when i run it the console shows Error uploading file. 
//  Help me check and fix the error