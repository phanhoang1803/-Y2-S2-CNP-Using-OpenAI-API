var message_log = [
	{ "role": "system", "content": "You are a helpful assistant." },
]

function return_response(result) {
	// Add the response to the chat log
	document.getElementById("chatLog").innerHTML +=
	"<div class=\"message\">"
		+ "<div class=\"logo\">  <img src=\"ABC_Logo.svg\" alt=\"Bot\" width=\"30\" height=\"30\">  </div>"
		+ "<div class=\"bot_text\" style=\"white-space: pre-wrap;\">" + result + "</div>"
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
			message_log = response.message;
			console.log(message_log);
			// $("#result").text(response.result);

			// Print the response into the web
			return_response(response.result);
		}
	});
}

function sendMessage() {
	var messageInput = document.getElementById("get.message");
	var messageValue = messageInput.value;
	messageInput.value = "";

	// Print the message into the web
	document.getElementById("chatLog").innerHTML +=
		"<div class=\"message user_background\">"
		+ "<div class=\"logo\">  <img src=\"USER_Logo.png\" alt=\"User\" width=\"30\" height=\"30\">  </div>"
		+ "<div class=\"user_text\">" + messageValue + "</div>"
		+ "</div>";

	// Get and print the response
	response(messageValue);
}