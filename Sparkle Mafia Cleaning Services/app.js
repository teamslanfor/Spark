// Sparkle Mafia Cleaning Services — shared site behaviour
(function(){
  "use strict";

  /* ---------- mobile nav ---------- */
  document.querySelectorAll("[data-nav-toggle]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var panel = document.querySelector("[data-mobile-panel]");
      if(panel) panel.classList.toggle("open");
    });
  });
  document.querySelectorAll("[data-mobile-panel] a").forEach(function(a){
    a.addEventListener("click", function(){
      var panel = document.querySelector("[data-mobile-panel]");
      if(panel) panel.classList.remove("open");
    });
  });

  /* ---------- sparkle particle fields ---------- */
  document.querySelectorAll(".sparkle-field").forEach(function(field){
    var count = parseInt(field.dataset.count || "22", 10);
    for(var i=0;i<count;i++){
      var s = document.createElement("span");
      s.className = "sparkle";
      s.style.left = (Math.random()*100) + "%";
      s.style.top = (Math.random()*100) + "%";
      s.style.animationDelay = (Math.random()*3.4) + "s";
      s.style.animationDuration = (2.6 + Math.random()*2.4) + "s";
      var size = 2 + Math.random()*3;
      s.style.width = size + "px";
      s.style.height = size + "px";
      field.appendChild(s);
    }
  });

  /* ---------- scroll reveal ---------- */
  var toReveal = document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window){
    toReveal.forEach(function(el){ el.classList.add("pre"); });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    toReveal.forEach(function(el){ io.observe(el); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function(item){
    var q = item.querySelector(".faq-q");
    if(!q) return;
    q.addEventListener("click", function(){
      var wasOpen = item.classList.contains("open");
      item.closest(".faq").querySelectorAll(".faq-item").forEach(function(i){ i.classList.remove("open"); });
      if(!wasOpen) item.classList.add("open");
    });
  });

  /* ---------- copy to clipboard ---------- */
  document.querySelectorAll("[data-copy]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var text = btn.getAttribute("data-copy");
      var done = function(){
        var original = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(function(){ btn.textContent = original; }, 1600);
      };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(done).catch(function(){
          fallbackCopy(text); done();
        });
      } else {
        fallbackCopy(text); done();
      }
    });
  });
  function fallbackCopy(text){
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand("copy"); }catch(e){}
    document.body.removeChild(ta);
  }

  /* ---------- lead / contact forms ---------- */
  document.querySelectorAll("form[data-lead-form]").forEach(function(form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function(field){
        var wrap = field.closest(".field");
        var errorEl = wrap ? wrap.querySelector(".field-error") : null;
        var isValid = field.checkValidity();
        if(!isValid){
          valid = false;
          if(wrap) wrap.classList.add("invalid");
          if(errorEl) errorEl.textContent = field.validity.valueMissing
            ? "This field is required"
            : field.validity.typeMismatch
              ? "Please check this value"
              : "Please check this value";
        } else {
          if(wrap) wrap.classList.remove("invalid");
          if(errorEl) errorEl.textContent = "";
        }
      });
      if(!valid){
        var firstInvalid = form.querySelector(".invalid input, .invalid select, .invalid textarea");
        if(firstInvalid) firstInvalid.focus();
        return;
      }
      var success = form.parentElement.querySelector(".form-success") || document.getElementById(form.dataset.successTarget || "");
      form.style.display = "none";
      if(success) success.classList.add("show");
    });
    form.querySelectorAll("input,select,textarea").forEach(function(field){
      field.addEventListener("input", function(){
        var wrap = field.closest(".field");
        if(wrap && field.checkValidity()){
          wrap.classList.remove("invalid");
          var errorEl = wrap.querySelector(".field-error");
          if(errorEl) errorEl.textContent = "";
        }
      });
    });
  });

  /* ---------- motion showcase canvas (stand-in for real video footage) ---------- */
  document.querySelectorAll("[data-motion-canvas]").forEach(function(canvas){
    var playBtn = canvas.closest(".motion-stage").parentElement.querySelector(".play-btn");
    var caption = canvas.closest(".motion-stage").querySelector(".motion-caption");
    var ctx = canvas.getContext("2d");
    var running = false;
    var particles = [];
    var raf;

    function resize(){
      var rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
    }
    window.addEventListener("resize", resize);
    resize();

    function spawn(){
      var w = canvas.width, h = canvas.height;
      particles.push({
        x: Math.random()*w,
        y: h + 20,
        r: (1.5 + Math.random()*2.5) * devicePixelRatio,
        vy: (0.6 + Math.random()*1.1) * devicePixelRatio,
        drift: (Math.random()-0.5)*0.6*devicePixelRatio,
        life: 0,
        hue: Math.random() > 0.5 ? "233,187,85" : "255,79,154"
      });
    }

    function tick(){
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0,0,w,h);
      var grad = ctx.createLinearGradient(0,0,0,h);
      grad.addColorStop(0, "rgba(23,11,29,1)");
      grad.addColorStop(1, "rgba(13,7,16,1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,w,h);

      if(Math.random() < 0.55) spawn();

      particles.forEach(function(p){
        p.y -= p.vy;
        p.x += p.drift;
        p.life += 1;
        var alpha = Math.max(0, 1 - p.life/220);
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + p.hue + "," + alpha + ")";
        ctx.shadowColor = "rgba(" + p.hue + ",0.9)";
        ctx.shadowBlur = 8 * devicePixelRatio;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
      });
      particles = particles.filter(function(p){ return p.y > -20 && p.life < 240; });

      raf = requestAnimationFrame(tick);
    }

    if(playBtn){
      playBtn.addEventListener("click", function(){
        running = !running;
        if(running){
          tick();
          playBtn.style.display = "none";
          if(caption) caption.querySelector(".eyebrow") && (caption.querySelector(".eyebrow").textContent = "PLAYING — ANIMATED PREVIEW");
        }
      });
    }
  });

  /* ---------------------------------------------------------
     Chat assistant — simple rule-based front-end widget.
     Not connected to a live person or an AI backend; it answers
     from a small set of canned replies and always offers the
     real phone number / email as a fallback.
  --------------------------------------------------------- */
  var CHAT_ANSWERS = [
    { k: ["price","cost","quote","how much","rate"], a: "We tailor every quote to the size of your home or office and how often you'd like us to visit — there's no fixed price list yet. The fastest way to get a free, no-obligation quote is to fill in the form on this page or call/WhatsApp 07502 372439." },
    { k: ["service","offer","what do you do","clean"], a: "We cover regular domestic cleaning, deep cleans, end of tenancy cleans, after-builders cleans, and office/commercial cleaning. Want details on any of these? Head to the Services page or ask me about one by name." },
    { k: ["area","location","sheffield","cover","where"], a: "We're based in Sheffield and cover the surrounding areas. Tell us your postcode when you enquire and we'll confirm straight away whether we're in your area." },
    { k: ["book","appointment","schedule","availability"], a: "You can request a booking via the quote form on this page, or call/text 07502 372439 and we'll find a time that suits you." },
    { k: ["hour","open","time","when"], a: "We haven't published fixed opening hours yet — the quickest way to check availability is to call or WhatsApp 07502 372439." },
    { k: ["tenancy","moving","move out"], a: "Our end of tenancy cleans are built to help you meet your checkout checklist. Get in touch with your move-out date and property size for a quote." },
    { k: ["office","commercial","business"], a: "Yes — we take on office and commercial cleaning contracts in Sheffield. Share a few details on the contact form and we'll get back to you." },
    { k: ["contact","email","phone","call","number"], a: "You can reach Sparkle Mafia Cleaning Services on 07502 372439 or sparkleglitzmafia@gmail.com — or just use the form on this page." },
    { k: ["thank","thanks","cheers"], a: "You're very welcome! Anything else you'd like to know before you enquire?" }
  ];
  var CHAT_FALLBACK = "Good question — I'm just a simple assistant so I don't have that detail yet. For anything specific, call or WhatsApp 07502 372439, email sparkleglitzmafia@gmail.com, or leave your details in the quote form and the team will get right back to you.";
  var CHAT_GREETING = "Hi! ✨ I'm the Sparkle Mafia assistant. Ask me about our services, pricing, areas we cover, or how to book — or tap a quick option below.";

  function initChat(){
    var launcher = document.querySelector("[data-chat-launcher]");
    var win = document.querySelector("[data-chat-window]");
    if(!launcher || !win) return;
    var body = win.querySelector("[data-chat-body]");
    var input = win.querySelector("[data-chat-input]");
    var sendBtn = win.querySelector("[data-chat-send]");
    var closeBtn = win.querySelector("[data-chat-close]");
    var opened = false;

    function addMsg(text, who){
      var div = document.createElement("div");
      div.className = "msg " + who;
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
      return div;
    }
    function botReply(userText){
      var typing = document.createElement("div");
      typing.className = "msg bot typing";
      typing.innerHTML = "<span></span><span></span><span></span>";
      body.appendChild(typing);
      body.scrollTop = body.scrollHeight;
      setTimeout(function(){
        typing.remove();
        var lower = userText.toLowerCase();
        var match = CHAT_ANSWERS.find(function(entry){
          return entry.k.some(function(kw){ return lower.indexOf(kw) !== -1; });
        });
        addMsg(match ? match.a : CHAT_FALLBACK, "bot");
      }, 650 + Math.random()*500);
    }

    launcher.addEventListener("click", function(){
      opened = !opened;
      win.classList.toggle("open", opened);
      if(opened && !body.dataset.greeted){
        body.dataset.greeted = "1";
        addMsg(CHAT_GREETING, "bot");
      }
    });
    if(closeBtn) closeBtn.addEventListener("click", function(){ opened = false; win.classList.remove("open"); });

    win.querySelectorAll("[data-chat-quick]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var text = btn.textContent;
        addMsg(text, "user");
        botReply(text);
      });
    });

    function send(){
      var val = input.value.trim();
      if(!val) return;
      addMsg(val, "user");
      input.value = "";
      botReply(val);
    }
    if(sendBtn) sendBtn.addEventListener("click", send);
    if(input) input.addEventListener("keydown", function(e){ if(e.key === "Enter") send(); });
  }
  initChat();

})();
