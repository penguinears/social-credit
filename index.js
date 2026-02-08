// --- MAIN CLIENT SCRIPT WITH GOOGLE AUTH ---

window.onload = function(){

  var firebaseConfig = {
    apiKey: "AIzaSyB5Ok9DqaliIqSTM0EZmXFJSZWWOjCX0aU",
    authDomain: "socialredit.firebaseapp.com",
    databaseURL: "https://socialredit-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "socialredit",
    storageBucket: "socialredit.appspot.com",
    appId: "1:664078097505:web:f9a4e3211f581d37441e20"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  var db = firebase.database();

  class SOCIAL_CREDIT {

    getAllTags(){
      return [
        { name: "Untrusty",        min: 15, direction: "down" },
        { name: "Unpopular",       min: 20, direction: "down" },
        { name: "Chud",            min: 28, direction: "down" },

        { name: "Mogger",          min: 35, direction: "up" },
        { name: "Cool",            min: 37, direction: "up" },
        { name: "Popular",         min: 40, direction: "up" },
        { name: "Trustworthy Guy", min: 45, direction: "up" },
        { name: "Warlord",         min: 60, direction: "up" },
        { name: "Supreme Leader",  min: 100, direction: "up" }
      ];
    }

    hasUnlockedTag(score, tag){
      if(tag.direction === "down") return score <= tag.min;
      if(tag.direction === "up")   return score >= tag.min;
      return false;
    }

    getUnlockedTags(score){
      return this.getAllTags().filter(t => this.hasUnlockedTag(score, t));
    }

    getDefaultTag(score){
      let unlocked = this.getUnlockedTags(score);
      if(unlocked.length === 0) return "";
      return unlocked[unlocked.length - 1].name;
    }

    // banned words placeholder – you add your own
    getBannedWords(){
      return [
        "cunt"
        // add your racist / homophobic slurs here privately
      ];
    }

    containsBannedWord(text){
      if(!text) return false;
      const lower = text.toLowerCase();
      const banned = this.getBannedWords();
      return banned.some(w => lower.includes(w));
    }

    getGlobalScoreRef(uid){
      return db.ref("scores/" + uid);
    }

    adjustScore(uid, delta, callback){
      let ref = this.getGlobalScoreRef(uid);
      ref.transaction(c => {
        if(!c) c = { score: 30 };
        c.score += delta;
        if(c.score < 0) c.score = 0;
        return c;
      }, (err, committed, snap) => {
        if(callback) callback(snap && snap.val() ? snap.val().score : 0);
      });
    }

    showBanner(msg){
      let b = document.getElementById("banner");
      if(!b){
        b = document.createElement("div");
        b.id = "banner";
        document.body.appendChild(b);
      }

      b.style.position = "fixed";
      b.style.left = "0";
      b.style.top = "-60px";
      b.style.width = "100%";
      b.style.padding = "15px";
      b.style.fontWeight = "bold";
      b.style.fontFamily = "Varela Round, sans-serif";
      b.style.textAlign = "center";
      b.style.transition = "top 0.2s ease";
      b.style.borderBottom = "4px solid #000";
      b.style.letterSpacing = "1px";
      b.style.textTransform = "uppercase";

      if(msg.includes("10 minutes")){
        b.style.background = "#ff2222";
        b.style.color = "#ffffff";
      } else {
        b.style.background = "#ffd700";
        b.style.color = "#b30000";
      }

      b.textContent = msg;
      b.style.top = "0px";
      setTimeout(()=>{ b.style.top = "-60px"; }, 6000);
    }

    getBuiltInRooms(){
      return ["General","Conspiracy Theories","Politics","Gaming","Debate"];
    }

    getRoomsRef(){
      return db.ref("rooms");
    }

    loadRooms(callback){
      this.getRoomsRef().once("value", snap => {
        let builtIn = this.getBuiltInRooms();
        let userRooms = [];

        if(snap.exists()){
          snap.forEach(child => {
            const name = child.key;
            const data = child.val() || {};
            if(builtIn.includes(name)){
              if(data.createdByUser !== false){
                this.getRoomsRef().child(name).update({ createdByUser: false });
              }
            } else {
              userRooms.push(name);
            }
          });
        }

        builtIn.forEach(r => {
          this.getRoomsRef().child(r).once("value", s => {
            if(!s.exists()){
              this.getRoomsRef().child(r).set({
                created: Date.now(),
                createdByUser: false
              });
            }
          });
        });

        callback({ builtIn, userRooms });
      });
    }

    chat(user){
      document.body.innerHTML = "";

      // title
      let t=document.createElement("div");
      t.id="title_container";
      let h=document.createElement("h1");
      h.id="title";
      h.textContent="Social Credit – the new kind of social media!";
      t.append(h);
      document.body.append(t);

      // controls
      let controls = document.createElement("div");
      controls.style.display = "flex";
      controls.style.justifyContent = "space-between";
      controls.style.alignItems = "center";
      controls.style.margin = "10px auto";
      controls.style.width = "420px";

      let roomWrap = document.createElement("div");
      roomWrap.style.display = "flex";
      roomWrap.style.flexDirection = "column";
      roomWrap.style.gap = "4px";

      let officialLabel = document.createElement("div");
      officialLabel.textContent = "Official rooms:";
      officialLabel.style.color = "#ffd700";
      officialLabel.style.fontSize = "13px";

      let officialSelect = document.createElement("select");
      officialSelect.style.padding = "4px";
      officialSelect.style.background = "#8b0000";
      officialSelect.style.color = "#ffd700";
      officialSelect.style.border = "2px solid #ffd700";
      officialSelect.style.fontFamily = "Varela Round, sans-serif";

      let userLabel = document.createElement("div");
      userLabel.textContent = "User‑made:";
      userLabel.style.color = "#ffd700";
      userLabel.style.fontSize = "13px";
      userLabel.style.marginTop = "4px";

      let userSelect = document.createElement("select");
      userSelect.style.padding = "4px";
      userSelect.style.background = "#8b0000";
      userSelect.style.color = "#ffd700";
      userSelect.style.border = "2px solid #ffd700";
      userSelect.style.fontFamily = "Varela Round, sans-serif";

      let createBtn = document.createElement("button");
      createBtn.id = "create_room_button";
      createBtn.textContent = "Create Room";
      createBtn.style.marginTop = "4px";

      roomWrap.append(officialLabel, officialSelect, userLabel, userSelect, createBtn);

      let meBtn = document.createElement("button");
      meBtn.textContent = "ME";
      meBtn.style.width = "80px";
      meBtn.style.marginTop = "0";
      meBtn.onclick = () => this.showMePanel(user);

      controls.append(roomWrap, meBtn);
      document.body.append(controls);

      // chat area
      let c=document.createElement("div");
      c.id="chat_container";
      let inner=document.createElement("div");
      inner.id="chat_inner_container";

      let box=document.createElement("div");
      box.id="chat_content_container";

      let input=document.createElement("input");
      input.placeholder="Say something...";

      let send=document.createElement("button");
      send.textContent="Send";

      inner.append(box,input,send);
      c.append(inner);
      document.body.append(c);

      this.loadRooms(({ builtIn, userRooms }) => {
        let currentRoom = localStorage.getItem("room") || "General";

        officialSelect.innerHTML = "";
        builtIn.forEach(r => {
          let opt = document.createElement("option");
          opt.value = r;
          opt.textContent = r;
          if(r === currentRoom) opt.selected = true;
          officialSelect.append(opt);
        });

        userSelect.innerHTML = "";
        userRooms.forEach(r => {
          let opt = document.createElement("option");
          opt.value = r;
          opt.textContent = r;
          if(r === currentRoom) opt.selected = true;
          userSelect.append(opt);
        });

        const setRoom = (roomName) => {
          localStorage.setItem("room", roomName);
          this.listen(user);
        };

        officialSelect.onchange = () => setRoom(officialSelect.value);
        userSelect.onchange     = () => setRoom(userSelect.value);

        createBtn.onclick = () => this.createRoomPrompt(user);

        this.setupChatControls(user, input, send);
        this.listen(user);
      });
    }

    createRoomPrompt(user){
      let name = prompt("Enter new room name:");
      if(!name) return;

      name = name.trim();
      if(name.length < 2){
        this.showBanner("Room name too short.");
        return;
      }
      if(name.length > 25){
        this.showBanner("Room name too long (max 25).");
        return;
      }

      if(this.containsBannedWord(name)){
        let room = localStorage.getItem("room") || "General";
        this.adjustScore(user.uid, -3, newScore => {
          db.ref("rooms/"+room+"/chats").push({
            name: "SYSTEM",
            message: user.displayName + " tried to create a bad room name and lost 3 social credit.",
            time: Date.now()
          });
          this.showBanner("Room name not allowed. -3 social credit.");
        });
        return;
      }

      this.getGlobalScoreRef(user.uid).once("value", v => {
        let score = v.val() ? v.val().score : 30;
        if(score <= 0){
          this.showBanner("Your social credit is too low to create rooms.");
          return;
        }

        let ref = this.getRoomsRef().child(name);
        ref.once("value", snap => {
          if(snap.exists()){
            this.showBanner("Room already exists.");
          } else {
            ref.set({ created: Date.now(), createdByUser: true }, () => {
              localStorage.setItem("room", name);
              this.chat(user);
            });
          }
        });
      });
    }

    setupChatControls(user, input, send){
      this.getGlobalScoreRef(user.uid).once("value", v => {
        let score = v.val() ? v.val().score : 30;

        if(score <= 0){
          input.disabled = true;
          send.disabled = true;
          input.placeholder = "🔒";
          input.style.textAlign = "center";
          input.style.fontSize = "22px";

          let createBtn = document.querySelector("#create_room_button");
          if(createBtn){
            createBtn.disabled = true;
            createBtn.style.opacity = "0.5";
          }

          this.showBanner("Your social credit is too low to participate.");
        } else {
          input.disabled = false;
          send.disabled = false;
          input.placeholder = "Say something...";
          input.style.textAlign = "left";
          input.style.fontSize = "16px";

          let createBtn = document.querySelector("#create_room_button");
          if(createBtn){
            createBtn.disabled = false;
            createBtn.style.opacity = "1";
          }
        }
      });

      send.onclick = () => {
        let room = localStorage.getItem("room") || "General";

        this.getGlobalScoreRef(user.uid).once("value", v => {
          let score = v.val() ? v.val().score : 30;
          if(score <= 0){
            this.showBanner("Your social credit is too low to participate.");
            return;
          }

          let text = input.value.trim();
          if(text.length === 0) return;
          if(text.length > 300){
            this.showBanner("Message too long (max 300).");
            return;
          }

          if(this.containsBannedWord(text)){
            this.adjustScore(user.uid, -3, newScore => {
              db.ref("rooms/"+room+"/chats").push({
                name: "SYSTEM",
                message: user.displayName + " used banned language and lost 3 social credit.",
                time: Date.now()
              });

              this.showBanner("Banned language detected. -3 social credit.");

              if(newScore <= 0){
                input.disabled = true;
                send.disabled = true;
                input.placeholder = "🔒";
                input.style.textAlign = "center";
                input.style.fontSize = "22px";

                let createBtn = document.querySelector("#create_room_button");
                if(createBtn){
                  createBtn.disabled = true;
                  createBtn.style.opacity = "0.5";
                }
              }
            });

            input.value = "";
            return;
          }

          db.ref("rooms/"+room+"/chats").push({
            name: user.displayName,
            uid: user.uid,
            message: text,
            time: Date.now()
          });

          input.value = "";
        });
      };
    }

    showMePanel(user){
      let existing = document.getElementById("me_panel");
      if(existing) existing.remove();

      let panel = document.createElement("div");
      panel.id = "me_panel";
      panel.style.position = "fixed";
      panel.style.top = "70px";
      panel.style.right = "10px";
      panel.style.width = "260px";
      panel.style.background = "#330000";
      panel.style.border = "3px solid "#ffd700";
      panel.style.padding = "10px";
      panel.style.color = "#ffd700";
      panel.style.fontFamily = "Varela Round, sans-serif";
      panel.style.zIndex = "9999";

      let title = document.createElement("div");
      title.textContent = "Your Titles (Global)";
      title.style.fontWeight = "bold";
      title.style.marginBottom = "6px";

      let close = document.createElement("div");
      close.textContent = "X";
      close.style.position = "absolute";
      close.style.top = "4px";
      close.style.right = "6px";
      close.style.cursor = "pointer";
      close.onclick = ()=>panel.remove();

      let list = document.createElement("div");
      list.style.maxHeight = "200px";
      list.style.overflowY = "auto";
      list.style.fontSize = "13px";

      panel.append(title, close, list);
      document.body.append(panel);

      let scoreRef = this.getGlobalScoreRef(user.uid);
      let tagRef   = db.ref("tags/"+user.uid);

      scoreRef.once("value", v=>{
        let score = v.val() ? v.val().score : 30;

        tagRef.once("value", tv=>{
          let equipped = tv.val() || "";

          let scoreLine = document.createElement("div");
          scoreLine.textContent = "Score: "+score;
          scoreLine.style.marginBottom = "6px";
          list.append(scoreLine);

          let all = this.getAllTags();
          all.forEach(t=>{
            let row = document.createElement("div");
            row.style.display = "flex";
            row.style.justifyContent = "space-between";
            row.style.alignItems = "center";
            row.style.marginBottom = "4px";

            let left = document.createElement("span");
            let isUnlocked = this.hasUnlockedTag(score, t);
            left.textContent = t.name + " (milestone: "+t.min+")" + (isUnlocked ? "" : " [LOCKED]");
            left.style.color = isUnlocked ? "#ffd700" : "#aa5555";

            let btn = document.createElement("button");
            btn.style.padding = "2px 6px";
            btn.style.fontSize = "11px";
            btn.style.marginTop = "0";

            if(score <= 0){
              btn.textContent = "Locked";
              btn.disabled = true;
            } else if(!isUnlocked){
              btn.textContent = "Locked";
              btn.disabled = true;
            } else if(equipped === t.name){
              btn.textContent = "Unequip";
              btn.onclick = ()=>{
                tagRef.remove();
                this.showBanner("Unequipped "+t.name);
                panel.remove();
              };
            } else {
              btn.textContent = "Equip";
              btn.onclick = ()=>{
                tagRef.set(t.name);
                this.showBanner("Equipped "+t.name);
                panel.remove();
              };
            }

            row.append(left, btn);
            list.append(row);
          });
        });
      });
    }

    listen(user){
      let room = localStorage.getItem("room") || "General";
      let box=document.getElementById("chat_content_container");
      if(!box) return;

      db.ref("rooms/"+room+"/chats")
        .orderByChild("time")
        .on("value",snap=>{
          box.innerHTML="";
          snap.forEach(s=>{
            let d=s.val();

            let row=document.createElement("div");
            row.className="message_container";

            let nameSpan=document.createElement("span");
            nameSpan.textContent=d.name+" ";

            let scoreSpan=document.createElement("span");
            scoreSpan.className="score";

            let up=document.createElement("span");
            up.textContent="▲";
            up.className="vote";

            let down=document.createElement("span");
            down.textContent="▼";
            down.className="vote";

            let tagSpan=document.createElement("span");
            tagSpan.className="tag";
            tagSpan.style.marginLeft = "4px";
            tagSpan.style.color = "#ccaa33";
            tagSpan.style.fontStyle = "italic";

            let msg=document.createElement("div");
            msg.textContent=d.message;

            if(d.name === "SYSTEM"){
              up.style.display = "none";
              down.style.display = "none";
              scoreSpan.style.display = "none";
              tagSpan.style.display = "none";
            } else {
              let uid = d.uid;
              if(!uid){
                up.style.display = "none";
                down.style.display = "none";
              } else {
                let scoreRef = this.getGlobalScoreRef(uid);
                let tagRef   = db.ref("tags/"+uid);

                scoreRef.once("value", v=>{
                  let scoreVal = v.val() ? v.val().score : 30;
                  scoreSpan.textContent = scoreVal + " ";

                  tagRef.once("value", tv=>{
                    let equipped = tv.val();
                    let tagToShow = equipped || this.getDefaultTag(scoreVal);
                    tagSpan.textContent = tagToShow ? "["+tagToShow+"]" : "";
                  });
                });

                up.onclick   = ()=>this.vote(user, uid, 1);
                down.onclick = ()=>this.vote(user, uid, -1);
              }
            }

            row.append(nameSpan,scoreSpan,up,down,tagSpan,msg);
            box.append(row);
          });

          box.scrollTop = box.scrollHeight;
        });
    }

    vote(voterUser, targetUid, delta){
      let room = localStorage.getItem("room") || "General";
      let now=Date.now();

      if(!voterUser || voterUser.uid === targetUid) return;

      this.getGlobalScoreRef(voterUser.uid).once("value", v => {
        let voterScore = v.val() ? v.val().score : 30;
        if(voterScore <= 0){
          this.showBanner("Your social credit is too low to participate.");
          return;
        }

        let ref=db.ref("votes/"+targetUid+"/"+voterUser.uid);

        ref.once("value",s=>{
          if(s.exists() && now - s.val() < 600000){
            this.showBanner("You can only vote every 10 minutes.");
            return;
          }

          this.adjustScore(targetUid, delta, () => {});
          ref.set(now);

          db.ref("rooms/"+room+"/chats").push({
            name:"SYSTEM",
            message: voterUser.displayName + " voted " + (delta > 0 ? "up" : "down"),
            time:Date.now()
          });

          this.showBanner("Vote recorded!");
        });
      });
    }
  }

  const app = new SOCIAL_CREDIT();

  firebase.auth().onAuthStateChanged(user => {
    if(user){
      // ensure score exists
      app.getGlobalScoreRef(user.uid).once("value", v => {
        if(!v.exists()){
          app.getGlobalScoreRef(user.uid).set({ score: 30 });
        }
        if(!localStorage.getItem("room")) localStorage.setItem("room","General");
        app.chat(user);
      });
    } else {
      // show simple sign‑in prompt
      document.body.innerHTML = "";
      let btn = document.createElement("button");
      btn.textContent = "Sign in with Google";
      btn.onclick = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider);
      };
      document.body.append(btn);
    }
  });
};
