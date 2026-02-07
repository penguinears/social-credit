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

    /* BANNER SYSTEM */
    showBanner(msg){
      let b = document.getElementById("banner");

      if(!b){
        b = document.createElement("div");
        b.id = "banner";
        document.body.appendChild(b);
      }

      if(msg.includes("10 minutes")){
        b.style.background = "#ff4444";
        b.style.color = "white";
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
      let c=document.createElement("div");
      c.id="join_container";
      let i=document.createElement("input");
      i.placeholder="Enter username";
      let b=document.createElement("button");
      b.textContent="Join";

      b.onclick=()=>{
        if(i.value.length>0){
          localStorage.setItem("name",i.value);
          this.rooms();
        }
      };

      let w=document.createElement("div");
      w.id="join_inner_container";
      w.append(i,b);
      c.append(w);
      document.body.append(c);
    }

    rooms(){
      document.body.innerHTML = "";
      this.title();

      let c = document.createElement("div");
      c.id = "join_container";

      let inner = document.createElement("div");
      inner.id = "join_inner_container";

      let label = document.createElement("div");
      label.style.marginBottom = "10px";
      label.textContent = "Choose a room:";

      let select = document.createElement("select");
      select.id = "room_select";
      select.style.width = "100%";
      select.style.padding = "10px";
      select.style.background = "#8b0000";
      select.style.color = "#ffd700";
      select.style.border = "2px solid #ffd700";

      ["General", "Gaming", "Politics", "Memes"].forEach(r=>{
        let opt = document.createElement("option");
        opt.value = r;
        opt.textContent = r;
        select.append(opt);
      });

      let btn = document.createElement("button");
      btn.textContent = "Enter Room";

      btn.onclick = () => {
        localStorage.setItem("room", select.value);
        this.chat();
      };

      inner.append(label, select, btn);
      c.append(inner);
      document.body.append(c);
    }

    chat(){
      document.body.innerHTML="";
      this.title();

      let c=document.createElement("div");
      c.id="chat_container";
      let inner=document.createElement("div");
      inner.id="chat_inner_container";

      let roomInfo = document.createElement("div");
      roomInfo.style.textAlign = "center";
      roomInfo.style.marginBottom = "10px";
      roomInfo.textContent = "Room: " + (localStorage.getItem("room") || "Unknown");

      let box=document.createElement("div");
      box.id="chat_content_container";

      let input=document.createElement("input");
      input.placeholder="Say something...";

      let send=document.createElement("button");
      send.textContent="Send";

      send.onclick=()=>{
        if(input.value.length>0){
          let room = localStorage.getItem("room");
          if(!room){
            this.showBanner("No room selected.");
            return;
          }
          db.ref("rooms/"+room+"/chats").push({
            name:this.get_name(),
            message:input.value,
            time:Date.now()
          });
          input.value="";
        }
      };

      inner.append(roomInfo, box, input, send);
      c.append(inner);
      document.body.append(c);

      this.listen();
    }

    get_name(){
      return localStorage.getItem("name");
    }

    listen(){
      let room = localStorage.getItem("room");
      let box=document.getElementById("chat_content_container");

      if(!room){
        box.innerHTML = "No room selected.";
        return;
      }

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

            let scoreRef=db.ref("rooms/"+room+"/scores/"+d.name);

            scoreRef.once("value",v=>{
              if(!v.exists()) scoreRef.set({score:30});
              scoreSpan.textContent=(v.val()?v.val().score:30)+" ";
            });

            up.onclick=()=>this.vote(d.name,1);
            down.onclick=()=>this.vote(d.name,-1);

            let msg=document.createElement("div");
            msg.textContent=d.message;

            if(d.name === "SYSTEM"){
              name.classList.add("system-name");
              msg.classList.add("system-msg");
            }

            row.append(name,scoreSpan,up,down,msg);
            box.append(row);
          });

          box.scrollTop = box.scrollHeight;
        });
    }

    vote(target,delta){
      let voter=this.get_name();
      let room = localStorage.getItem("room");
      let now=Date.now();

      if(!room){
        this.showBanner("No room selected.");
        return;
      }

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
    if(localStorage.getItem("room")) app.chat();
    else app.rooms();
  } else {
    app.home();
  }
};
