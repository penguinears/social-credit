// --- SERVER BOT ANNOUNCEMENT SCRIPT ---
// This file runs independently and posts automated messages every 30 seconds.

var firebaseConfig = {
  apiKey: "AIzaSyB5Ok9DqaliIqSTM0EZmXFJSZWWOjCX0aU",
  authDomain: "socialredit.firebaseapp.com",
  databaseURL: "https://socialredit-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "socialredit",
  storageBucket: "socialredit.appspot.com",
  appId: "1:664078097505:web:f9a4e3211f581d37441e20"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();

// Messages the bot will randomly choose from
const announcements = [
  "If it feels like a ghost town here, check out our debate times and topics!",
  "Be appropriate — our supreme leader hates inappropriate words.",
  "Remember to vote responsibly. Your social credit depends on it.",
  "Invite your friends!  More people means more money for me.",
  "Tip: You can vote every 10 minutes. Use your power wisely.",
  "Stay active! The supreme leader is always watching.",
  "Feeling lonely? Start a conversation — someone will join soon.",
  "Respect others. Negative behavior lowers your social credit quickly."
];

// Function to post a bot message
function postAnnouncement() {
  const msg = announcements[Math.floor(Math.random() * announcements.length)];

  db.ref("chats").push({
    name: "SERVER BOT",
    message: msg,
    time: Date.now()
  });
}

// Post every 30 seconds
setInterval(postAnnouncement, 999000);
