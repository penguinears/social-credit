window.onload = function() {

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

  class SOCIAL_CREDIT {

    home() {
      document.body.innerHTML = "";
      this.title();
      this.join();
    }

    title() {
      let t = document.createElement("div");
      t.id = "title_container";
      let h = document.createElement("h1");
      h.id = "title";
      h.textContent = "Social Credit – the new kind of social media!";
      t.append(h);
      document.body.append(t);
    }

    join() {
      let c = document.createElement("div");
      c.id = "join_container";

      let i = document.createElement("input");
      i.placeholder = "Enter username";
      i.id = "join_input";

      let b = document.createElement("button");
      b.textContent = "Join";
      b.id = "join_button";

      b.onclick = () => {
        if (i.value.length > 0) {
          localStorage.setItem("name", i.value);
          this.chat();
        }
      };

      let w = document.createElement("div");
      w.id = "join_inner_container";
      w.append(i, b);
      c.append(w);
      document.body.append(c);
    }

    chat() {
      document.body.innerHTML = "";
      this.title();

      let c = document.createElement("div");
      c.id = "chat_container";

      let inner = document.createElement("div");
      inner.id = "chat_inner_container";

      let box = document.createElement("div");
      box.id = "chat_content_container";

      let input = document.createElement("input");
      input.id = "chat_input";
      input.placeholder = "Say something...";

      let send = document.createElement("button");
      send.id = "chat_input_send";
      send.textContent = "Send";

      send.onclick = () => {
        if (input.value.length > 0) {
          db.ref("chats").push({
            name: this.get_name(),
            message: input.value,
            time: Date.now()
          });
          input.value = "";
        }
      };

      inner.append(box, input, send);
      c.append(inner);
      document.body.append(c);

      this.listenMessages();
      this.listenScores();
    }

    get_name() {
      return localStorage.getItem("name");
    }

    listenMessages() {
      let box = document.getElementById("chat_content_container");

      db.ref("chats").orderByChild("time").on("value", snap => {
        box.innerHTML = "";
        snap.forEach(s => {
          let d = s.val();

          let row = document.createElement("div");
          row.className = "message_container";

          let name = document.createElement("span");
          name.textContent = d.name + " ";
          name.style.fontWeight = "bold";

          let scoreSpan = document.createElement("span");
          scoreSpan.className = "score";
          scoreSpan.dataset.user = d.name;
          scoreSpan.style.marginRight = "5px";

          let up = document.createElement("button");
          up.textContent = "▲";
          up.className = "vote";
          up.style.marginRight = "3px";
          up.style.fontSize = "18px";
          up.style.touchAction = "manipulation";

          let down = document.createElement("button");
          down.textContent = "▼";
          down.className = "vote";
          down.style.fontSize = "18px";
          down.style.touchAction = "manipulation";

          up.onclick = () => this.vote(d.name, 1);
          down.onclick = () => this.vote(d.name, -1);

          let msg = document.createElement("div");
          msg.textContent = d.message;
          msg.style.marginTop = "4px";

          row.append(name, scoreSpan, up, down, msg);
          box.append(row);
        });
      });
    }

    listenScores() {
      db.ref("scores").on("value", snap => {
        snap.forEach(userSnap => {
          let name = userSnap.key;
          let score = userSnap.val().score;
          document.querySelectorAll(`.score[data-user="${name}"]`).forEach(s => {
            s.textContent = score + " ";
          });
        });
      });
    }

    vote(target, delta) {
      let voter = this.get_name();
      if (voter === target) return; // can't vote yourself

      let now = Date.now();
      let voteRef = db.ref(`votes/${target}/${voter}`);

      voteRef.once("value", s => {
        // 10 minutes cooldown = 600,000 ms
        if (s.exists() && now - s.val() < 600000) {
          alert("You can only vote on the same person every 10 minutes.");
          return;
        }

        let scoreRef = db.ref(`scores/${target}`);
        scoreRef.transaction(c => {
          if (!c) c = { score: 30 };
          c.score += delta;
          return c;
        });

        voteRef.set(now); // record the last vote time
      });
    }
  }

  let app = new SOCIAL_CREDIT();
  if (app.get_name()) app.chat();
  else app.home();
};
