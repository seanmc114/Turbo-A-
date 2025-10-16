// Turbo: Q+ Edition — Statements Mode (confetti + banner + shake)
// New game variant: Present statements (no questions).
// Accents are kept. "ñ" is written as "n" (per your keyboard rule).
// Storage keys are namespaced so this won't collide with the old game.
//
// Drop-in replacement for script.js

(() => {
  const $  = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // ===================== CONFIG =====================
  const QUESTIONS_PER_ROUND = 10;
  const PENALTY_PER_WRONG   = 30;
  const BASE_THRESH = { 1:200, 2:180, 3:160, 4:140, 5:120, 6:100, 7:80, 8:60, 9:40 };

  // ---- Unique namespace for THIS game (prevents clash with old data)
  const GAME_ID = "tqplus:statements-v1";

  // Global Spanish-read tokens (cap 7, commit-on-finish)
  const GLOBAL_CHEATS_MAX = 7;
  const GLOBAL_CHEATS_KEY = `${GAME_ID}:globalCheats`;

  // ===================== DATA (Present statements) =====================
  // Accents kept. "ñ" is written as "n".
  const LEVELS = {
    1: [
      { en: "You are happy.",            es: "Estás feliz." },
      { en: "You are tall.",             es: "Eres alto." },
      { en: "You are in class.",         es: "Estás en clase." },
      { en: "You are kind.",             es: "Eres amable." },
      { en: "You are tired.",            es: "Estás cansado." },
      { en: "You are ready.",            es: "Estás lista." },        // feminine
      { en: "You are calm.",             es: "Estás tranquilo." },
      { en: "You are funny.",            es: "Eres gracioso." },
      { en: "You are strong.",           es: "Eres fuerte." },
      { en: "You are beautiful.",        es: "Eres bonita." },        // feminine
    ],

    2: [
      { en: "It is a cat.",              es: "Es un gato." },
      { en: "It is a dog.",              es: "Es un perro." },
      { en: "It is a sunny day.",        es: "Es un día soleado." },
      { en: "It is cold.",               es: "Hace frío." },
      { en: "You are at home.",          es: "Estás en casa." },
      { en: "It is blue.",               es: "Es azul." },
      { en: "It is big.",                es: "Es grande." },
      { en: "It is small.",              es: "Es pequeno." },          // pequeño → "pequeno" (no ñ)
      { en: "It is interesting.",        es: "Es interesante." },
      { en: "It is beautiful.",          es: "Es bonito." },
    ],

    3: [
      { en: "You live in Madrid.",       es: "Vives en Madrid." },
      { en: "You study Spanish.",        es: "Estudias espanol." },    // español → "espanol"
      { en: "You play football.",        es: "Juegas al fútbol." },
      { en: "You like chocolate.",       es: "Te gusta el chocolate." },
      { en: "You work hard.",            es: "Trabajas mucho." },
      { en: "You read books.",           es: "Lees libros." },
      { en: "You eat fruit.",            es: "Comes fruta." },
      { en: "You drink water.",          es: "Bebes agua." },
      { en: "You listen to music.",      es: "Escuchas música." },
      { en: "You sing well.",            es: "Cantas bien." },
    ],

    4: [
      { en: "Carlos is your teacher.",   es: "Carlos es tu profesor." },
      { en: "Ana is at school.",         es: "Ana está en la escuela." },
      { en: "You sleep early.",          es: "Duermes temprano." },
      { en: "You run fast.",             es: "Corres rápido." },
      { en: "You learn every day.",      es: "Aprendes cada día." },
      { en: "You work in an office.",    es: "Trabajas en una oficina." },
      { en: "You like English.",         es: "Te gusta el inglés." },
      { en: "You walk to school.",       es: "Caminas a la escuela." },
      { en: "María is your friend.",     es: "María es tu amiga." },   // feminine
      { en: "You are busy.",             es: "Estás ocupado." },
    ],

    5: [
      { en: "They are students.",        es: "Son estudiantes." },
      { en: "You are playing football.", es: "Juegas al fútbol." },
      { en: "You are going to the park.",es: "Vas al parque." },
      { en: "You arrive early.",         es: "Llegas temprano." },
      { en: "You are never late.",       es: "Nunca llegas tarde." },
      { en: "You know a lot.",           es: "Sabes mucho." },
      { en: "You prefer apples.",        es: "Prefieres manzanas." },
      { en: "The idea is good.",         es: "La idea es buena." },    // feminine agreement
      { en: "You speak Spanish.",        es: "Hablas espanol." },
      { en: "We have time.",             es: "Tenemos tiempo." },
    ],

    6: [
      { en: "Luis helps you.",           es: "Luis te ayuda." },
      { en: "You need a pencil.",        es: "Necesitas un lápiz." },
      { en: "Your house is big.",        es: "Tu casa es grande." },
      { en: "You eat lunch at twelve.",  es: "Almuerzas a las doce." },
      { en: "You study Spanish.",        es: "Estudias espanol." },
      { en: "You go to school by bus.",  es: "Vas a la escuela en autobús." },
      { en: "You are in class five.",    es: "Estás en la clase cinco." },
      { en: "It is your turn.",          es: "Es tu turno." },
      { en: "You have two pets.",        es: "Tienes dos mascotas." },
      { en: "It costs ten euros.",       es: "Cuesta diez euros." },
    ],

    7: [
      { en: "You help at home.",         es: "Ayudas en casa." },
      { en: "You eat breakfast at eight.", es: "Desayunas a las ocho." },
      { en: "You go out on weekends.",   es: "Sales los fines de semana." },
      { en: "You wake up early.",        es: "Te despiertas temprano." },
      { en: "You run every morning.",    es: "Corres cada manana." },  // mañana → "manana"
      { en: "You feel good today.",      es: "Te sientes bien hoy." },
      { en: "You like this movie.",      es: "Te gusta esta película." },
      { en: "Your phone is on the table.", es: "Tu teléfono está en la mesa." },
      { en: "You study two hours.",      es: "Estudias dos horas." },
      { en: "You have little homework.", es: "Tienes poca tarea." },
    ],

    8: [
      { en: "Someone is calling.",       es: "Alguien llama." },
      { en: "They are working.",         es: "Trabajan." },
      { en: "You go to school every day.", es: "Vas a la escuela cada día." },
      { en: "You finish work at three.", es: "Terminas el trabajo a las tres." },
      { en: "You are tired now.",        es: "Estás cansado ahora." },
      { en: "You travel by train.",      es: "Viajas en tren." },
      { en: "You like the color blue.",  es: "Te gusta el color azul." },
      { en: "Your bag is new.",          es: "Tu bolsa es nueva." },   // feminine
      { en: "Many people live here.",    es: "Mucha gente vive aquí." },
      { en: "You drink water every day.",es: "Bebes agua cada día." },
    ],

    9: [
      { en: "You open the door.",        es: "Abres la puerta." },
      { en: "You say good morning.",     es: "Dices buenos días." },
      { en: "You go home after class.",  es: "Vas a casa después de clase." },
      { en: "You arrive at school early.", es: "Llegas a la escuela temprano." },
      { en: "You leave at four.",        es: "Te vas a las cuatro." },
      { en: "You do your homework.",     es: "Haces tu tarea." },
      { en: "You choose a car.",         es: "Eliges un coche." },
      { en: "Your shoes are clean.",     es: "Tus zapatos están limpios." },
      { en: "Students pass the exam.",   es: "Los estudiantes aprueban el examen." },
      { en: "You drink milk.",           es: "Bebes leche." },
    ],

    10: [
      { en: "You wait for Ana.",         es: "Esperas a Ana." },
      { en: "You think about your friends.", es: "Piensas en tus amigos." },
      { en: "You want to travel.",       es: "Quieres viajar." },
      { en: "You return home at six.",   es: "Vuelves a casa a las seis." },
      { en: "You are here now.",         es: "Estás aquí ahora." },
      { en: "You learn a lot.",          es: "Aprendes mucho." },
      { en: "You prefer these shoes.",   es: "Prefieres estos zapatos." },
      { en: "It is your turn to cook.",  es: "Es tu turno de cocinar." },
      { en: "You read many books.",      es: "Lees muchos libros." },
      { en: "We have enough time.",      es: "Tenemos suficiente tiempo." },
    ],
  };

  // ✅ Present alias (what the rest of the app expects)
  const Present = LEVELS;

  // Deep copy helper (used to build Past/Future from Present safely)
  const deepCopy = obj => JSON.parse(JSON.stringify(obj));

  // ✅ Build datasets object using the correct Present variable
  const DATASETS = { Present: Present, Past: deepCopy(Present), Future: deepCopy(Present) };

  // ===== FAIL-SAFE TENSE ACCESS — guarantees access & switching =====
  (function tenseAccessFailsafe(){
    const canon = x => {
      const k = String(x||"").trim().toLowerCase();
      if (k==="present") return "Present";
      if (k==="past")    return "Past";
      if (k==="future")  return "Future";
      return null;
    };
    function selectTense(t){
      if (!DATASETS || !DATASETS[t]) { console.warn("[TQ] Missing dataset for:", t); return; }
      CURRENT_TENSE = t;
      $$("#tense-buttons .tense-button").forEach(b=>{
        const key = canon(b.dataset.tense || b.textContent);
        b.classList.toggle("active", key === t);
        b.disabled = false;
        b.style.pointerEvents = "auto";
      });
      backToLevels();
    }
    // Wire existing buttons (delegation + direct)
    document.addEventListener("click", (e)=>{
      const btn = e.target.closest && e.target.closest(".tense-button");
      if (!btn || !btn.closest("#tense-buttons")) return;
      e.preventDefault();
      const t = canon(btn.dataset.tense || btn.textContent);
      if (t) selectTense(t);
    });
    $$("#tense-buttons .tense-button").forEach(btn=>{
      const t = canon(btn.dataset.tense || btn.textContent);
      if (t) btn.onclick = ev => { ev.preventDefault(); selectTense(t); };
    });
    // Inject a tiny toolbar if page bar is absent/broken
    function ensureInjectedBar(){
      if (document.getElementById("tq-failsafe-tense")) return;
      const bar = document.createElement("div");
      bar.id = "tq-failsafe-tense";
      bar.style.cssText = "position:fixed;top:10px;right:10px;z-index:99999;background:#fff;border:1px solid #ddd;border-radius:10px;box-shadow:0 6px 16px rgba(0,0,0,.15);padding:8px 10px;font:14px/1.2 system-ui,Segoe UI,Arial";
      bar.innerHTML = `
        <div style="font-weight:700;margin-bottom:6px">Tense</div>
        <div style="display:flex;gap:6px">
          <button data-k="Present">Present</button>
          <button data-k="Past">Past</button>
          <button data-k="Future">Future</button>
        </div>
      `;
      bar.querySelectorAll("button[data-k]").forEach(b=>{
        b.onclick = e => { e.preventDefault(); selectTense(b.dataset.k); };
      });
      document.body.appendChild(bar);
    }
    // Remove any celebration overlay that could block clicks
    const ghost = document.querySelector(".tq-celebrate-overlay");
    if (ghost) { try { ghost.remove(); } catch(_) {} }
    // Boot: ensure access immediately
    function boot(){
      const haveButtons = !!document.querySelector("#tense-buttons .tense-button");
      if (!haveButtons) ensureInjectedBar();
      selectTense("Present"); // default in and render levels immediately
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
    // Keyboard shortcuts P/A/F
    document.addEventListener("keydown",(e)=>{
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k==="p") selectTense("Present");
      if (k==="a") selectTense("Past");
      if (k==="f") selectTense("Future");
    });
  })();

  // ===================== Global cheats =====================
  const clampCheats = n => Math.max(0, Math.min(GLOBAL_CHEATS_MAX, n|0));
  function getGlobalCheats(){
    const v = localStorage.getItem(GLOBAL_CHEATS_KEY);
    if (v == null) { localStorage.setItem(GLOBAL_CHEATS_KEY, String(GLOBAL_CHEATS_MAX)); return GLOBAL_CHEATS_MAX; }
    const n = parseInt(v,10);
    return Number.isFinite(n) ? clampCheats(n) : GLOBAL_CHEATS_MAX;
  }
  function setGlobalCheats(n){ localStorage.setItem(GLOBAL_CHEATS_KEY, String(clampCheats(n))); }

  // ===================== Compare (STATEMENTS MODE) =====================
  const norm = s => (s||"").trim();
  function core(s){
    let t = norm(s);
    // tolerate stray question marks
    if (t.startsWith("¿")) t = t.slice(1);
    if (t.endsWith("?"))  t = t.slice(0,-1);
    // normalization for compare: strip accents; map ñ→n
    t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    t = t.replace(/ñ/gi, "n");
    return t.replace(/\s+/g," ").toLowerCase();
  }
  function cmpAnswer(user, expected){ return core(user) === core(expected); }

  // ===================== Best/unlocks (per tense) =====================
  const STORAGE_PREFIX = `${GAME_ID}:best`;
  const bestKey = (tense, lvl) => `${STORAGE_PREFIX}:${tense}:${lvl}`;
  function getBest(tense, lvl){ const v = localStorage.getItem(bestKey(tense,lvl)); const n = v==null?null:parseInt(v,10); return Number.isFinite(n)?n:null; }
  function saveBest(tense, lvl, score){ const prev = getBest(tense,lvl); if (prev==null || score<prev) localStorage.setItem(bestKey(tense,lvl), String(score)); }
  function isUnlocked(tense, lvl){ if (lvl===1) return true; const need = BASE_THRESH[lvl-1]; const prev = getBest(tense,lvl-1); return prev!=null && (need==null || prev<=need); }

  // ===================== Helpers =====================
  function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
  function speak(text, lang="es-ES"){ try{ if(!("speechSynthesis" in window)) return; const u=new SpeechSynthesisUtterance(text); u.lang=lang; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);}catch{} }
  let rec=null, recActive=false;
  function ensureRecognizer(){ const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR) return null; if(!rec){ rec=new SR(); rec.lang="es-ES"; rec.interimResults=false; rec.maxAlternatives=1; } return rec; }
  function startDictationFor(input,onStatus){
    const r=ensureRecognizer(); if(!r){onStatus&&onStatus(false);return;}
    if(recActive){try{r.stop();}catch{} recActive=false; onStatus&&onStatus(false);}
    try{
      r.onresult=e=>{
        const txt=(e.results[0]&&e.results[0][0]&&e.results[0][0].transcript)||"";
        const v=txt.trim();
        input.value = v; // statements (no auto '?')
        input.dispatchEvent(new Event("input",{bubbles:true}));
      };
      r.onend=()=>{recActive=false; onStatus&&onStatus(false);};
      recActive=true; onStatus&&onStatus(true); r.start();
    }catch{ onStatus&&onStatus(false); }
  }
  function miniBtn(text,title){ const b=document.createElement("button"); b.type="button"; b.textContent=text; b.title=title; b.setAttribute("aria-label",title);
    Object.assign(b.style,{fontSize:"0.85rem",lineHeight:"1",padding:"4px 8px",marginLeft:"6px",border:"1px solid #ddd",borderRadius:"8px",background:"#fff",cursor:"pointer",verticalAlign:"middle"}); return b; }

  // ===================== Celebration Styles & Helpers =====================
  function injectCelebrationCSS(){
    if (document.getElementById("tqplus-anim-style")) return;
    const css = `
    @keyframes tq-burst { 0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(100vh) rotate(720deg); opacity:0} }
    @keyframes tq-pop { 0%{transform:scale(0.6); opacity:0} 25%{transform:scale(1.05); opacity:1} 60%{transform:scale(1)} 100%{opacity:0} }
    @keyframes tq-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
    .tq-celebrate-overlay{ position:fixed; inset:0; z-index:9999; pointer-events:none; }
    .tq-confetti{ position:absolute; width:8px; height:14px; border-radius:2px; opacity:0.95; will-change:transform,opacity; animation:tq-burst 1600ms ease-out forwards; }
    .tq-perfect-banner{ position:fixed; left:50%; top:16%; transform:translateX(-50%); padding:10px 18px; border-radius:12px; font-weight:900; font-size:28px; letter-spacing:1px;
      color:#fff; background:linear-gradient(90deg,#ff2d55,#ff9f0a); box-shadow:0 10px 30px rgba(0,0,0,0.25); animation:tq-pop 1800ms ease-out forwards; text-shadow:0 1px 2px rgba(0,0,0,0.35); }
    .tq-shake{ animation:tq-shake 650ms ease-in-out; }
    `;
    const s=document.createElement("style"); s.id="tqplus-anim-style"; s.textContent=css; document.head.appendChild(s);
  }

  function showPerfectCelebration(){
    injectCelebrationCSS();
    const overlay = document.createElement("div");
    overlay.className = "tq-celebrate-overlay";
    document.body.appendChild(overlay);

    const COLORS = ["#ff2d55","#ff9f0a","#ffd60a","#34c759","#0a84ff","#bf5af2","#ff375f"];
    const W = window.innerWidth;
    for (let i=0; i<120; i++){
      const c = document.createElement("div");
      c.className = "tq-confetti";
      const size = 6 + Math.random()*8;
      c.style.width  = `${size}px`;
      c.style.height = `${size*1.4}px`;
      c.style.left   = `${Math.random()*W}px`;
      c.style.top    = `${-20 - Math.random()*120}px`;
      c.style.background = COLORS[i % COLORS.length];
      c.style.animationDelay = `${Math.random()*200}ms`;
      c.style.transform = `rotate(${Math.random()*360}deg)`;
      overlay.appendChild(c);
    }

    const banner = document.createElement("div");
    banner.className = "tq-perfect-banner";
    banner.textContent = "PERFECT!";
    document.body.appendChild(banner);

    setTimeout(()=>{ overlay.remove(); banner.remove(); }, 2200);
  }

  // ===================== UI flow =====================
  let CURRENT_TENSE = "Present";
  let quiz = [], currentLevel = null, t0=0, timerId=null, submitted=false;

  // attempt-local token tracking (commit on finish)
  let cheatsUsedThisRound = 0;
  let globalSnapshotAtStart = 0;
  const attemptRemaining = () => Math.max(0, globalSnapshotAtStart - cheatsUsedThisRound);

  function updateESButtonsState(container){
    const left = attemptRemaining();
    const esBtns = Array.from(container.querySelectorAll('button[data-role="es-tts"]'));
    esBtns.forEach(btn=>{
      const active = left>0;
      btn.disabled = !active;
      btn.style.opacity = active ? "1" : "0.5";
      btn.style.cursor  = active ? "pointer" : "not-allowed";
      btn.title = active ? `Read Spanish target (uses 1; attempt left: ${left})` : "No Spanish reads left for this attempt";
    });
  }

  function startTimer(){
    t0 = Date.now();
    clearInterval(timerId);
    timerId = setInterval(()=>{ const t=Math.floor((Date.now()-t0)/1000); const el=$("#timer"); if(el) el.textContent=`Time: ${t}s`; },200);
  }
  function stopTimer(){ clearInterval(timerId); timerId=null; return Math.floor((Date.now()-t0)/1000); }

  function renderLevels(){
    const host = $("#level-list"); if(!host) return;
    host.innerHTML = "";
    const ds = DATASETS[CURRENT_TENSE] || {};
    const available = Object.keys(ds).map(n=>parseInt(n,10)).filter(Number.isFinite).sort((a,b)=>a-b);
    available.forEach(i=>{
      const unlocked = isUnlocked(CURRENT_TENSE,i);
      const best = getBest(CURRENT_TENSE,i);
      const btn = document.createElement("button");
      btn.className="level-btn"; btn.disabled=!unlocked;
      btn.textContent = unlocked?`Level ${i}`:`🔒 Level ${i}`;
      if (unlocked && best!=null){
        const span=document.createElement("span"); span.className="best"; span.textContent=` (Best Score: ${best}s)`; btn.appendChild(span);
      }
      if (unlocked) btn.onclick=()=>startLevel(i);
      host.appendChild(btn);
    });
    host.style.display="flex"; const gm=$("#game"); if(gm) gm.style.display="none";
  }

  function startLevel(level){
    currentLevel = level; submitted=false; cheatsUsedThisRound=0; globalSnapshotAtStart=getGlobalCheats();
    const lv=$("#level-list"); if(lv) lv.style.display="none";
    const res=$("#results"); if(res) res.innerHTML="";
    const gm=$("#game"); if(gm) gm.style.display="block";

    const pool=(DATASETS[CURRENT_TENSE]?.[level])||[];
    const sample=Math.min(QUESTIONS_PER_ROUND,pool.length);
    quiz = shuffle(pool).slice(0,sample).map(it=>({prompt:it.en, answer:it.es, user:""}));

    renderQuiz(); startTimer();
  }

  function renderQuiz(){
    const qwrap=$("#questions"); if(!qwrap) return; qwrap.innerHTML="";
    quiz.forEach((q,i)=>{
      const row=document.createElement("div"); row.className="q";

      const p=document.createElement("div"); p.className="prompt"; p.textContent=`${i+1}. ${q.prompt}`;
      const controls=document.createElement("span");
      Object.assign(controls.style,{display:"inline-block",marginLeft:"6px",verticalAlign:"middle"});

      const enBtn=miniBtn("🔈 EN","Read English prompt"); enBtn.onclick=()=>speak(q.prompt,"en-GB");
      const esBtn=miniBtn("🔊 ES","Read Spanish target (uses 1 this attempt)"); esBtn.setAttribute("data-role","es-tts");
      esBtn.onclick=()=>{ if (attemptRemaining()<=0){ updateESButtonsState(qwrap); return; } speak(q.answer,"es-ES"); cheatsUsedThisRound+=1; updateESButtonsState(qwrap); };
      const micBtn=miniBtn("🎤","Dictate into this answer"); micBtn.onclick=()=>{ startDictationFor(input,(on)=>{ micBtn.style.borderColor=on?"#f39c12":"#ddd"; micBtn.style.boxShadow=on?"0 0 0 2px rgba(243,156,18,0.25)":"none"; }); };

      controls.appendChild(enBtn); controls.appendChild(esBtn); controls.appendChild(micBtn); p.appendChild(controls);

      const input=document.createElement("input"); input.type="text"; input.placeholder="Type the Spanish here";
      input.oninput=e=>{ quiz[i].user=e.target.value; };
      input.addEventListener("keydown",(e)=>{ if(e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey){ if(e.code==="KeyR"){e.preventDefault();enBtn.click();} else if(e.code==="KeyS"){e.preventDefault();esBtn.click();} else if(e.code==="KeyM"){e.preventDefault();micBtn.click();} }});

      row.appendChild(p); row.appendChild(input); qwrap.appendChild(row);
    });
    updateESButtonsState(qwrap);

    const submit=$("#submit"); if(submit){ submit.disabled=false; submit.textContent="Finish & Check"; submit.onclick=finishAndCheck; }
    const back=$("#back-button"); if(back){ back.style.display="inline-block"; back.onclick=backToLevels; }
  }

  function finishAndCheck(){
    if (submitted) return; submitted=true;

    const elapsed=stopTimer();
    const inputs=$$("#questions input"); inputs.forEach((inp,i)=>{ quiz[i].user=inp.value; });

    let correct=0, wrong=0;
    quiz.forEach((q,i)=>{ const ok=cmpAnswer(q.user,q.answer); if(ok) correct++; else wrong++; inputs[i].classList.remove("good","bad"); inputs[i].classList.add(ok?"good":"bad"); inputs[i].readOnly=true; inputs[i].disabled=true; });

    const penalties = wrong*PENALTY_PER_WRONG;
    const finalScore = elapsed + penalties;

    const submit=$("#submit"); if(submit){ submit.disabled=true; submit.textContent="Checked"; }

    // Unlock message
    let unlockMsg="";
    if (currentLevel<10){
      const need=BASE_THRESH[currentLevel];
      if (typeof need==="number"){
        if (finalScore<=need) unlockMsg=`🎉 Next level unlocked! (Needed ≤ ${need}s)`;
        else unlockMsg=`🔓 Need ${finalScore-need}s less to unlock Level ${currentLevel+1} (Target ≤ ${need}s).`;
      }
    } else unlockMsg="🏁 Final level — great work!";

    // ===== Commit global tokens now =====
    const before = getGlobalCheats();
    let after = clampCheats(globalSnapshotAtStart - cheatsUsedThisRound);
    const perfect = (correct===quiz.length);
    if (perfect && after<GLOBAL_CHEATS_MAX) after = clampCheats(after+1);
    setGlobalCheats(after);

    // Results UI
    const results=$("#results"); if(!results) return;
    const summary=document.createElement("div"); summary.className="result-summary";
    summary.innerHTML =
      `<div class="line" style="font-size:1.35rem; font-weight:800;">🏁 FINAL SCORE: ${finalScore}s</div>
       <div class="line">⏱️ Time: <strong>${elapsed}s</strong></div>
       <div class="line">➕ Penalties: <strong>${wrong} × ${PENALTY_PER_WRONG}s = ${penalties}s</strong></div>
       <div class="line">✅ Correct: <strong>${correct}/${quiz.length}</strong></div>
       <div class="line" style="margin-top:8px;"><strong>${unlockMsg}</strong></div>
       <div class="line" style="margin-top:8px;">🎧 Spanish reads used this round: <strong>${cheatsUsedThisRound}</strong> &nbsp;|&nbsp; Global after commit: <strong>${after}/${GLOBAL_CHEATS_MAX}</strong></div>`;

    if (perfect){
      showPerfectCelebration();
      summary.classList.add("tq-shake");
      const bonusNote = document.createElement("div");
      bonusNote.className = "line";
      bonusNote.style.marginTop = "6px";
      bonusNote.innerHTML = (after>before)
        ? `⭐ Perfect round! Spanish-read tokens: ${before} → ${after} (max ${GLOBAL_CHEATS_MAX}).`
        : `⭐ Perfect round! (Spanish-read tokens already at max ${GLOBAL_CHEATS_MAX}).`;
      summary.appendChild(bonusNote);
    }

    const ul=document.createElement("ul");
    quiz.forEach(q=>{
      const li=document.createElement("li"); const ok=cmpAnswer(q.user,q.answer);
      li.className=ok?"correct":"incorrect";
      li.innerHTML = `${q.prompt} — <strong>${q.answer}</strong>` + (ok?"":` &nbsp;❌&nbsp;(you: “${q.user||""}”)`);
      ul.appendChild(li);
    });

    const again=document.createElement("button");
    again.className="try-again"; again.textContent="Try Again"; again.onclick=()=>startLevel(currentLevel);

    results.innerHTML=""; results.appendChild(summary); results.appendChild(ul); results.appendChild(again);

    saveBest(CURRENT_TENSE,currentLevel,finalScore);
    summary.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function backToLevels(){ stopTimer(); const gm=$("#game"); if(gm) gm.style.display="none"; renderLevels(); }

  // ===================== Init =====================
  document.addEventListener("DOMContentLoaded", ()=>{
    // init global cheats
    setGlobalCheats(getGlobalCheats());

    // style default active if your HTML provides the buttons
    const presentBtn = $(`#tense-buttons .tense-button[data-tense="Present"]`) || $$("#tense-buttons .tense-button")[0];
    if (presentBtn) presentBtn.classList.add("active");

    renderLevels();
  });
})();
