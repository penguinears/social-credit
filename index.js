// --- MAIN CLIENT SCRIPT ---

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

    /* TAG DEFINITIONS */
    getAllTags(){
      return [
        { name: "Untrustable",     min: 15 },
        { name: "Unpopular",       min: 20 },
        { name: "Chud",            min: 28 },
        { name: "Mogger",          min: 35 },
        { name: "Cool",            min: 37 },
        { name: "Popular",         min: 40 },
        { name: "Trustworthy Guy", min: 45 },
        { name: "Warlord",         min: 60 },
        { name: "Supreme Leader",  min: 100 }
      ];
    }

    getUnlockedTags(score){
      return this.getAllTags().filter(t => score >= t.min);
    }

    getDefaultTag(score){
      let unlocked = this.getUnlockedTags(score);
      if(unlocked.length === 0) return "";
      return unlocked[unlocked.length - 1].name; // highest unlocked
    }

    /* BANNER SYSTEM */
    showBanner(msg){
      let b = document.getElementById("banner");

      if(!b){
        b = document.createElement("div");
        b.id = "banner";
        document.body.appendChild(b);
      }

      // rougher look
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
      b.style.borderRadius = "0";
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

      b.classList.remove("shake");
      void b.offsetWidth;
      b.classList.add("shake");

      b.style.top = "0px";

      setTimeout(()=>{
        b.style.top = "-60px";
      }, 6000);
    }

    home(){
      document.body.innerHTML="";
      this.title();
      this.join();
    }

    title(){
      let t=document.createElement("div");
      t.id="title_container";
      let h=document.createElement("h1");
      h.id="title";
      h.textContent="Social Credit – the new kind of social media!";
      t.append(h);
      document.body.append(t);
    }

    join(){
      document.body.innerHTML = "";
      this.title();

      let c=document.createElement("div");
      c.id="join_container";
      let i=document.createElement("input");
      i.placeholder="Enter username";
      let b=document.createElement("button");
      b.textContent="Join";

      b.onclick=()=>{
        if(i.value.length>0){
          localStorage.setItem("name",i.value);
          localStorage.setItem("room","General");
          this.chat();
        }
      };

      let w=document.createElement("div");
      w.id="join_inner_container";
      w.append(i,b);
      c.append(w);
      document.body.append(c);
    }

    getRoomsList(){
      return ["General", "Conspiracy Theories", "Politics", "Gaming", "Debate"];
    }

    chat(){
      document.body.innerHTML="";
      this.title();

      // top controls: room switcher + ME button
      let controls = document.createElement("div");
      controls.style.display = "flex";
      controls.style.justifyContent = "space-between";
      controls.style.alignItems = "center";
      controls.style.margin = "10px auto";
      controls.style.width = "420px";

      // room switcher
      let roomWrap = document.createElement("div");
      roomWrap.style.display = "flex";
      roomWrap.style.alignItems = "center";
      roomWrap.style.gap = "6px";

      let roomLabel = document.createElement("span");
      roomLabel.textContent = "Room:";
      roomLabel.style.color = "#ffd700";

      let roomSelect = document.createElement("select");
      roomSelect.style.padding = "6px";
      roomSelect.style.background = "#8b0000";
      roomSelect.style.color = "#ffd700";
      roomSelect.style.border = "2px solid #ffd700";
      roomSelect.style.fontFamily = "Varela Round, sans-serif";

      let currentRoom = localStorage.getItem("room") || "General";
      this.getRoomsList().forEach(r=>{
        let opt = document.createElement("option");
        opt.value = r;
        opt.textContent = r;
        if(r === currentRoom) opt.selected = true;
        roomSelect.append(opt);
      });

      roomSelect.onchange = () => {
        localStorage.setItem("room", roomSelect.value);
        this.chat();
      };

      roomWrap.append(roomLabel, roomSelect);

      // ME button (top-right)
      let meBtn = document.createElement("button");
      meBtn.textContent = "ME";
      meBtn.style.width = "80px";
      meBtn.style.marginTop = "0";
      meBtn.onclick = () => this.showMePanel();

      controls.append(roomWrap, meBtn);
      document.body.append(controls);

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

      send.onclick=()=>{
        if(input.value.length>0){
          let room = localStorage.getItem("room") || "General";
          db.ref("rooms/"+room+"/chats").push({
            name:this.get_name(),
            message:input.value,
            time:Date.now()
          });
          input.value="";
        }
      };

      inner.append(box,input,send);
      c.append(inner);
      document.body.append(c);

      this.listen();
    }

    get_name(){
      return localStorage.getItem("name");
    }

    showMePanel(){
      let existing = document.getElementById("me_panel");
      if(existing) existing.remove();

      let room = localStorage.getItem("room") || "General";
      let name = this.get_name();
      if(!name){
        this.showBanner("No username set.");
        return;
      }

      let panel = document.createElement("div");
      panel.id = "me_panel";
      panel.style.position = "fixed";
      panel.style.top = "70px";
      panel.style.right = "10px";
      panel.style.width = "260px";
      panel.style.background = "#330000";
      panel.style.border = "3px solid #ffd700";
      panel.style.padding = "10px";
      panel.style.color = "#ffd700";
      panel.style.fontFamily = "Varela Round, sans-serif";
      panel.style.zIndex = "9999";

      let title = document.createElement("div");
      title.textContent = "Your Titles ("+room+")";
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

      let scoreRef = db.ref("rooms/"+room+"/scores/"+name);
      let tagRef   = db.ref("rooms/"+room+"/tags/"+name);

      scoreRef.once("value", v=>{
        let score = v.val() ? v.val().score : 30;
        let unlocked = this.getUnlockedTags(score);

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
            let isUnlocked = score >= t.min;
            left.textContent = t.name + " (≥"+t.min+")" + (isUnlocked ? "" : " [LOCKED]");
            left.style.color = isUnlocked ? "#ffd700" : "#aa5555";

            let btn = document.createElement("button");
            btn.style.padding = "2px 6px";
            btn.style.fontSize = "11px";
            btn.style.marginTop = "0";

            if(!isUnlocked){
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

    listen(){
      let room = localStorage.getItem("room") || "General";
      let box=document.getElementById("chat_content_container");

      db.ref("rooms/"+room+"/chats")
        .orderByChild("time")
        .on("value",snap=>{
          box.innerHTML="";
          snap.forEach(s=>{
            let d=s.val();

            let row=document.createElement("div");
            row.className="message_container";

            let name=document.createElement("span");
            name.textContent=d.name+" ";

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

            let scoreRef=db.ref("rooms/"+room+"/scores/"+d.name);
            let tagRef  =db.ref("rooms/"+room+"/tags/"+d.name);

            scoreRef.once("value",v=>{
              let scoreVal = v.val() ? v.val().score : 30;
              if(!v.exists()) scoreRef.set({score:30});
              scoreSpan.textContent = scoreVal + " ";

              tagRef.once("value", tv=>{
                let equipped = tv.val();
                let tagToShow = equipped || this.getDefaultTag(scoreVal);
                tagSpan.textContent = tagToShow ? "["+tagToShow+"]" : "";
              });
            });

            up.onclick=()=>this.vote(d.name,1);
            down.onclick=()=>this.vote(d.name,-1);

            let msg=document.createElement("div");
            msg.textContent=d.message;

            if(d.name === "SYSTEM"){
              name.classList.add("system-name");
              msg.classList.add("system-msg");
            }

            row.append(name,scoreSpan,up,down,tagSpan,msg);
            box.append(row);
          });

          box.scrollTop = box.scrollHeight;
        });
    }

    vote(target,delta){
      let voter=this.get_name();
      let room = localStorage.getItem("room") || "General";
      let now=Date.now();

      let ref=db.ref("rooms/"+room+"/votes/"+target+"/"+voter);

      ref.once("value",s=>{

        if(s.exists() && now - s.val() < 600000){
          this.showBanner("You can only vote every 10 minutes.");
          return;
        }

        let scoreRef=db.ref("rooms/"+room+"/scores/"+target);
        scoreRef.transaction(c=>{
          if(!c) c={score:30};
          c.score+=delta;
          return c;
        });

        ref.set(now);

        db.ref("rooms/"+room+"/chats").push({
          name:"SYSTEM",
          message: voter + " voted " + target + (delta > 0 ? " ↑" : " ↓"),
          time:Date.now()
        });

        this.showBanner("Vote recorded!");
      });
    }
  }

  let app=new SOCIAL_CREDIT();
  if(app.get_name()){
    if(!localStorage.getItem("room")) localStorage.setItem("room","General");
    app.chat();
  } else {
    app.home();
  }
};
