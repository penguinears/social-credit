// serverBot.js

const serverMessages = [
  "Join the live debate at 9 PM London time!",
  "Please be appropiate. Inappropriate language will not be tolerated by our supreme leaders.",
  "If it feels like a ghost town in chat look at our debate times and topics!",
  "email us at socialcreditteam@gmail.com"
];

const chatContainer = document.getElementById("chat_content_container");

function postServerMessage(message) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message_container");
  msgDiv.innerHTML = `<strong style="color:#ffd700;">Server:</strong> ${message}`;
  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

setInterval(() => {
  const randomIndex = Math.floor(Math.random() * serverMessages.length);
  postServerMessage(serverMessages[randomIndex]);
}, 30000);

function postAtTime(hour, minute, message) {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);

  if (target <= now) target.setDate(target.getDate() + 1);

  const timeout = target - now;
  setTimeout(() => {
    postServerMessage(message);
    postAtTime(hour, minute, message);
  }, timeout);
}

postAtTime(21, 0, "Join the live debate at 9 PM London time!");
