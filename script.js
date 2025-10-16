// Turbo: Q+ Edition — Perfect Round Celebration (confetti + banner + shake)
// Keeps all previous functionality from your last version: global tokens (cap 7, commit-on-finish),
// unlock ramp 200→…→40, Try Again, TTS/voice, identical UI/brand.
//
// Drop-in replacement for script.js

(() => {
  const $  = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // ===================== CONFIG =====================
  const QUESTIONS_PER_ROUND = 10;
  const PENALTY_PER_WRONG   = 30;
  const BASE_THRESH = { 1:200, 2:180, 3:160, 4:140, 5:120, 6:100, 7:80, 8:60, 9:40 };

  // Global Spanish-read tokens (cap 7, commit-on-finish)
  const GLOBAL_CHEATS_MAX = 7;
  const GLOBAL_CHEATS_KEY = "tqplus:v3:globalCheats";

  // ===================== DATA (present-based for all tenses) =====================
  const PRESENT = {
    1:[{en:"Who?",es:"¿Quién?"},{en:"What?",es:"¿Qué?"},{en:"Where?",es:"¿Dónde?"},{en:"When?",es:"¿Cuándo?"},{en:"Why?",es:"¿Por qué?"},{en:"How?",es:"¿Cómo?"},{en:"Which?",es:"¿Cuál?"},{en:"Whose?",es:"¿De quién?"},{en:"How many?",es:"¿Cuántos?"},{en:"How much?",es:"¿Cuánto?"},{en:"From where?",es:"¿De dónde?"},{en:"To where?",es:"¿Adónde?"},{en:"Since when?",es:"¿Desde cuándo?"},{en:"Until when?",es:"¿Hasta cuándo?"},{en:"How often?",es:"¿Con qué frecuencia?"},{en:"How old?",es:"¿Cuántos años?"}],
    2:[{en:"Who is it?",es:"¿Quién es?"},{en:"What is it?",es:"¿Qué es?"},{en:"Where are you?",es:"¿Dónde estás?"},{en:"When is it?",es:"¿Cuándo es?"},{en:"Why is it cold?",es:"¿Por qué hace frío?"},{en:"How are you?",es:"¿Cómo estás?"},{en:"Which one?",es:"¿Cuál?"},{en:"Whose book is it?",es:"¿De quién es el libro?"},{en:"How many students?",es:"¿Cuántos estudiantes?"},{en:"How much money?",es:"¿Cuánto dinero?"},{en:"Where is it?",es:"¿Dónde está?"},{en:"When do we meet?",es:"¿Cuándo nos vemos?"}],
    3:[{en:"Who are you?",es:"¿Quién eres?"},{en:"What do you want?",es:"¿Qué quieres?"},{en:"Where do you live?",es:"¿Dónde vives?"},{en:"When do you study?",es:"¿Cuándo estudias?"},{en:"Why are you here?",es:"¿Por qué estás aquí?"},{en:"How do you feel?",es:"¿Cómo te sientes?"},{en:"Which is your house?",es:"¿Cuál es tu casa?"},{en:"Whose idea is it?",es:"¿De quién es la idea?"},{en:"How many brothers do you have?",es:"¿Cuántos hermanos tienes?"},{en:"How much water do you drink?",es:"¿Cuánta agua bebes?"}],
    4:[{en:"Who is your teacher?",es:"¿Quién es tu profesor?"},{en:"What time is it?",es:"¿Qué hora es?"},{en:"Where do you work?",es:"¿Dónde trabajas?"},{en:"When do you sleep?",es:"¿Cuándo duermes?"},{en:"Why are you sad?",es:"¿Por qué estás triste?"},{en:"How do you learn?",es:"¿Cómo aprendes?"},{en:"Which subject do you like?",es:"¿Qué asignatura te gusta?"},{en:"Whose car is this?",es:"¿De quién es este coche?"},{en:"How many friends do you have?",es:"¿Cuántos amigos tienes?"},{en:"How long is the class?",es:"¿Cuánto dura la clase?"}],
    5:[{en:"Who are they?",es:"¿Quiénes son ellos?"},{en:"What are you doing?",es:"¿Qué haces?"},{en:"Where are you going?",es:"¿Adónde vas?"},{en:"When do you arrive?",es:"¿Cuándo llegas?"},{en:"Why are you late?",es:"¿Por qué llegas tarde?"},{en:"How do you know?",es:"¿Cómo sabes?"},{en:"Which one do you prefer?",es:"¿Cuál prefieres?"},{en:"Whose idea is that?",es:"¿De quién es esa idea?"},{en:"How many languages do you speak?",es:"¿Cuántos idiomas hablas?"},{en:"How much time do we have?",es:"¿Cuánto tiempo tenemos?"}],
    6:[{en:"Who helps you?",es:"¿Quién te ayuda?"},{en:"What do you need?",es:"¿Qué necesitas?"},{en:"Where is your house?",es:"¿Dónde está tu casa?"},{en:"When do you eat lunch?",es:"¿Cuándo almuerzas?"},{en:"Why do you study Spanish?",es:"¿Por qué estudias español?"},{en:"How do you get to school?",es:"¿Cómo llegas a la escuela?"},{en:"Which class are you in?",es:"¿En qué clase estás?"},{en:"Whose turn is it?",es:"¿De quién es el turno?"},{en:"How many pets do you have?",es:"¿Cuántas mascotas tienes?"},{en:"How much does it cost?",es:"¿Cuánto cuesta?"}],
    7:[{en:"Who helps you at home?",es:"¿Quién te ayuda en casa?"},{en:"What do you eat for breakfast?",es:"¿Qué desayunas?"},{en:"Where do you go on weekends?",es:"¿Adónde vas los fines de semana?"},{en:"When do you wake up?",es:"¿Cuándo te despiertas?"},{en:"Why do you run?",es:"¿Por qué corres?"},{en:"How do you feel today?",es:"¿Cómo te sientes hoy?"},{en:"Which movie do you like?",es:"¿Qué película te gusta?"},{en:"Whose phone is this?",es:"¿De quién es este teléfono?"},{en:"How many hours do you study?",es:"¿Cuántas horas estudias?"},{en:"How much homework do you have?",es:"¿Cuánta tarea tienes?"}],
    8:[{en:"Who is calling?",es:"¿Quién llama?"},{en:"What are they doing?",es:"¿Qué hacen?"},{en:"Where do you go every day?",es:"¿Adónde vas cada día?"},{en:"When do you finish work?",es:"¿Cuándo terminas el trabajo?"},{en:"Why are you tired?",es:"¿Por qué estás cansado?"},{en:"How do you travel to school?",es:"¿Cómo viajas a la escuela?"},{en:"Which color do you like?",es:"¿Qué color te gusta?"},{en:"Whose bag is that?",es:"¿De quién es esa bolsa?"},{en:"How many people live here?",es:"¿Cuántas personas viven aquí?"},{en:"How much water do you drink every day?",es:"¿Cuánta agua bebes cada día?"}],
    9:[{en:"Who opens the door?",es:"¿Quién abre la puerta?"},{en:"What do you say?",es:"¿Qué dices?"},{en:"Where do you go after class?",es:"¿Adónde vas después de clase?"},{en:"When do you arrive at school?",es:"¿Cuándo llegas a la escuela?"},{en:"Why do you leave early?",es:"¿Por qué te vas temprano?"},{en:"How do you do it?",es:"¿Cómo lo haces?"},{en:"Which car do you choose?",es:"¿Qué coche eliges?"},{en:"Whose shoes are these?",es:"¿De quién son estos zapatos?"},{en:"How many students pass?",es:"¿Cuántos estudiantes aprueban?"},{en:"How much milk do you drink?",es:"¿Cuánta leche bebes?"}],
    10:[{en:"Who are you waiting for?",es:"¿A quién esperas?"},{en:"What are you thinking about?",es:"¿En qué piensas?"},{en:"Where do you want to go?",es:"¿Adónde quieres ir?"},{en:"When do you return home?",es:"¿Cuándo vuelves a casa?"},{en:"Why are you here?",es:"¿Por qué estás aquí?"},{en:"How do you learn so much?",es:"¿Cómo aprendes tanto?"},{en:"Which of these do you prefer?",es:"¿Cuál de estos prefieres?"},{en:"Whose turn is it to cook?",es:"¿De quién es el turno de cocinar?"},{en:"How many books do you read?",es:"¿Cuántos libros lees?"},{en:"How much time do we have?",es:"¿Cuánto tiempo tenemos?"}]
  };
  const deepCopy = obj => JSON.parse(JSON.stringify(obj));
  const DATASETS = { Present: PRESENT, Past: deepCopy(PRESENT), Future: deepCopy(PRESENT) };

  // ===================== Global cheats =====================
  const clampCheats = n => Math.max(0, Math.min(GLOBAL_CHEATS_MAX, n|0));
  function getGlobalCheats(){
    const v = localStorage.getItem(GLOBAL_CHEATS_KEY);
    if (v == null) { localStorage.setItem(GLOBAL_CHEATS_KEY, String(GLOBAL_CHEATS_MAX)); return GLOBAL_CHEATS_MAX; }
    const n = parseInt(v,10);
    return Number.isFinite(n) ? clampCheats(n) : GLOBAL_CHEATS_MAX;
  }
  function setGlobalCheats(n){ localStorage.setItem(GLOBAL_CHEATS_KEY, String(clampCheats(n))); }

  // ===================== Compare =====================
  const norm = s => (s||"").trim();
  const endsWithQM = s => norm(s).endsWith("?");
  function core(s){
    let t = norm(s);
    if (t.startsWith("¿")) t = t.slice(1);
    if (t.endsWith("?"))  t = t.slice(0,-1);
    t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    t = t.replace(/ñ/gi, "n");
    return t.replace(/\s+/g," ").toLowerCase();
  }
  function cmpAnswer(user, expected){ if (!endsWithQM(user)) return false; return core(user) === core(expected); }

  // ===================== Best/unlocks (per tense) =====================
  const STORAGE_PREFIX = "tqplus:v3";
  const bestKey = (tense, lvl) => `${STORAGE_PREFIX}:best:${tense}:${lvl}`;
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
      r.onresult=e=>{ const txt=(e.results[0]&&e.results[0][0]&&e.results[0][0].transcript)||""; const v=txt.trim(); input.value = v.endsWith("?")?v:(v+"?"); input.dispatchEvent(new Event("input",{bubbles:true})); };
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
    // overlay
    const overlay = document.createElement("div");
    overlay.className = "tq-celebrate-overlay";
    document.body.appendChild(overlay);

    // make 120 confetti bits across width
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

    // banner
    const banner = document.createElement("div");
    banner.className = "tq-perfect-banner";
    banner.textContent = "PERFECT!";
    document.body.appendChild(banner);

    // cleanup after 2.2s
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

      const input=document.createElement("input"); input.type="text"; input.placeholder="Type the Spanish here (must end with ?)";
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

    // Celebrate on perfect
    if (perfect){
      showPerfectCelebration();
      // subtle shake on the summary box so it "feels" like a win
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

    // tense switching (present-based datasets across all)
    $$("#tense-buttons .tense-button").forEach(btn=>{
      btn.addEventListener("click", e=>{
        e.preventDefault();
        const t = btn.dataset.tense || btn.textContent.trim();
        if (!DATASETS[t]) return;
        $$("#tense-buttons .tense-button").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        CURRENT_TENSE = t;
        backToLevels();
      });
    });

    // default active
    const presentBtn = $(`#tense-buttons .tense-button[data-tense="Present"]`) || $$("#tense-buttons .tense-button")[0];
    if (presentBtn) presentBtn.classList.add("active");

    renderLevels();
  });
})();
