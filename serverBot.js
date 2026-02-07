// --- SERVER BOT ANNOUNCEMENT SCRIPT ---
// Posts automated messages every 8 minutes, but ONLY in rooms with recent activity.

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

// Bot messages
const announcements = [
  "If it feels like a ghost town here, check out our debate times and topics!",
  "Be appropriate — our supreme leader hates inappropriate words.",
  "Remember to vote responsibly. Your social credit depends on it.",
  "Invite your friends! More people means more money for me.",
  "Tip: You can vote every 10 minutes. Use your power wisely.",
  "Stay active! The supreme leader is always watching.",
  "Feeling lonely? Start a conversation — someone will join soon.",
  "Respect others. Negative behavior lowers your social credit quickly."
];

// Rooms
const rooms = [
  "General",
  "Conspiracy Theories",
  "Politics",
  "Gaming",
  "Debate"
];

// Check if a room has activity in the last 15 minutes
function roomIsActive(room, callback) {
  const fifteenMinutes = 15 * 60 * 1000;
  const cutoff = Date.now() - fifteenMinutes;

  db.ref("rooms/" + room + "/chats")
    .orderByChild("time")
    .startAt(cutoff)
    .limitToFirst(1)
    .once("value", snap => {
      callback(snap.exists());
    });
}

// Post a bot message
function postAnnouncement(room) {
  const msg = announcements[Math.floor(Math.random() * announcements.length)];

  db.ref("rooms/" + room + "/chats").push({
    name: "SERVER BOT",
    message: msg,
    time: Date.now()
  });
}

// Every 8 minutes, check each room and post only in active ones
setInterval(() => {
  rooms.forEach(room => {
    roomIsActive(room, isActive => {
      if (isActive) {
        postAnnouncement(room);
      }
    });
  });
}, 480000); // 8 minutes
