window.onload = function(){

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
          this.chat();
        }
      };

      let w=document.createElement("div");
      w.id="join_inner_container";
      w.append(i,b);
      c.append(w);
      document.body.append(c);
    }

    chat(){
      document.body.innerHTML="";
      this.title();

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
          db.ref("chats").push({
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

    listen(){
      let box=document.getElementById("chat_content_container");
      db.ref("chats").orderByChild("time").on("value",snap=>{
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

          let scoreRef=db.ref("scores/"+d.name);

          scoreRef.once("value",v=>{
            if(!v.exists()) scoreRef.set({score:30});
            scoreSpan.textContent=(v.val()?v.val().score:30)+" ";
          });

          up.onclick=()=>this.vote(d.name,1);
          down.onclick=()=>this.vote(d.name,-1);

          let msg=document.createElement("div");
          msg.textContent=d.message;

          row.append(name,scoreSpan,up,down,msg);
          box.append(row);
        });
      });
    }

    vote(target,delta){
      let voter=this.get_name();
      let now=Date.now();
      let ref=db.ref("votes/"+target+"/"+voter);

      ref.once("value",s=>{
        if(s.exists() && now-s.val()<3600000){
          alert("You can only rate once per hour.");
          return;
        }

        let scoreRef=db.ref("scores/"+target);
        scoreRef.transaction(c=>{
          if(!c) c={score:30};
          c.score+=delta;
          return c;
        });

        ref.set(now);
      });
    }
  }

  let app=new SOCIAL_CREDIT();
  if(app.get_name()) app.chat();
  else app.home();
}
