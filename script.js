/* MindMend — script.js
   Dark aesthetic version — interactions & localStorage
*/

(function(){
  // -- initial elements
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // simple navigation (buttons scroll and reveal)
  document.querySelectorAll('.nav-btn, .primary, .ghost[data-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = btn.dataset.target;
      if(!target) return;
      // hide panels and show target
      document.querySelectorAll('main .panel').forEach(p => p.classList.add('hidden'));
      const el = document.getElementById(target);
      if(el) el.classList.remove('hidden');
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });

  // show hero by default
  document.getElementById('home').classList.remove('hidden');

  // --- Mood tracker & quote
  const moods = document.querySelectorAll('.mood');
  const moodMsg = document.getElementById('moodMsg');
  const saveMood = document.getElementById('saveMood');
  const getQuote = document.getElementById('getQuote');

  const quotes = [
    "You are stronger than you think.",
    "Small steps are still progress.",
    "Breathe. You are doing your best.",
    "It's okay to rest today.",
    "Reach out — you don't have to be alone."
  ];

  function pickQuote(){ return quotes[Math.floor(Math.random()*quotes.length)]; }
  if(getQuote) getQuote.addEventListener('click', ()=> { document.getElementById('moodMsg').textContent = pickQuote(); });

  let selectedMood = null;
  moods.forEach(b => {
    b.addEventListener('click', ()=> {
      selectedMood = b.dataset.mood || b.textContent;
      moodMsg.textContent = `You feel ${selectedMood}. That's valid. Try a breathing moment if needed.`;
      // visual highlight
      moods.forEach(x => x.style.transform = '');
      b.style.transform = 'scale(1.08)';
    });
  });

  // Save mood as journal entry
  if(saveMood) saveMood.addEventListener('click', ()=> {
    if(!selectedMood){ alert('Pick a mood first.'); return; }
    saveJournalEntry(`Mood: ${selectedMood}`);
    moodMsg.textContent = 'Saved to your journal.';
    selectedMood = null;
    moods.forEach(x => x.style.transform = '');
  });

  // --- Breathing guide
  const breathCircle = document.getElementById('breathCircle');
  const startBreath = document.getElementById('startBreath');
  const stopBreath = document.getElementById('stopBreath');
  let breathing = false;
  let breathTimer = null;

  function breathCycle(){
    if(!breathing) return;
    if(breathCircle) breathCircle.style.transform = 'scale(1.4)';
    setTimeout(()=> {
      if(breathCircle) breathCircle.style.transform = 'scale(1)';
    }, 4000);
    breathTimer = setTimeout(breathCycle, 8000);
  }
  if(startBreath) startBreath.addEventListener('click', ()=> {
    if(breathing) return;
    breathing = true;
    breathCycle();
    startBreath.disabled = true;
    stopBreath.disabled = false;
  });
  if(stopBreath) stopBreath.addEventListener('click', ()=> {
    breathing = false; clearTimeout(breathTimer);
    if(breathCircle) breathCircle.style.transform = 'scale(1)';
    startBreath.disabled = false;
    stopBreath.disabled = true;
  });
  if(stopBreath) stopBreath.disabled = true;

  // --- Quick stress test
  const testQ = [
    "Have you felt nervous or on edge recently?",
    "Have worries kept you up at night?",
    "Have you felt irritable or short-tempered?",
    "Have tasks felt overwhelming recently?",
    "Have you had trouble focusing because of stress?"
  ];
  let qIndex = 0, score = 0;
  const startTest = document.getElementById('startTest');
  const testArea = document.getElementById('testArea');
  const qBox = document.getElementById('qBox');
  const ansYes = document.getElementById('ansYes');
  const ansNo = document.getElementById('ansNo');
  const testResult = document.getElementById('testResult');

  if(startTest) startTest.addEventListener('click', ()=> {
    qIndex = 0; score = 0; testResult.textContent = '';
    if(testArea) testArea.classList.remove('hidden');
    if(qBox) qBox.textContent = testQ[qIndex];
  });

  if(ansYes) ansYes.addEventListener('click', ()=> { score++; nextQ(); });
  if(ansNo) ansNo.addEventListener('click', ()=> { nextQ(); });

  function nextQ(){
    qIndex++;
    if(qIndex < testQ.length){
      if(qBox) qBox.textContent = testQ[qIndex];
    } else { showResult(); }
  }
  function showResult(){
    if(testArea) testArea.classList.add('hidden');
    if(testResult){
      if(score <= 1) testResult.textContent = `Low stress (${score}/${testQ.length}). Keep healthy routines.`;
      else if(score <= 3) testResult.textContent = `Moderate stress (${score}/${testQ.length}). Try breaks & breathing.`;
      else testResult.textContent = `High stress (${score}/${testQ.length}). Consider talking to someone.`;
    }
  }

  // --- Comfort Chat (simple rules)
  const chatLog = document.getElementById('chatLog');
  const chatInput = document.getElementById('chatInput');
  const sendChat = document.getElementById('sendChat');

  const botReplies = [
    {match:/sad|down|depress/i, reply:"I'm sorry you're feeling low. Small steps can help — try a short walk or breathing."},
    {match:/anxious|anxiety|nervous/i, reply:"Anxiety is heavy. Try breathing: inhale 4s, exhale 4s. You're not alone."},
    {match:/stress|stressed|overwhelm/i, reply:"Break tasks into tiny pieces and take a calming break."},
    {match:/help|suicide|hurt|kill/i, reply:"If you are thinking about harming yourself, contact emergency services or a helpline immediately."}
  ];

  function botRespond(text){
    for(const r of botReplies) if(r.match.test(text)) return r.reply;
    const defaults = [
      "Thanks for sharing. It's okay to feel how you feel.",
      "You matter. Try naming five things you can see right now.",
      "If this feels heavy, consider speaking to someone you trust."
    ];
    return defaults[Math.floor(Math.random()*defaults.length)];
  }

  function appendChat(who, text){
    const el = document.createElement('div');
    el.className = 'entry';
    el.innerHTML = `<small class="muted">${who}</small><div>${escapeHtml(text)}</div>`;
    if(chatLog) { chatLog.appendChild(el); chatLog.scrollTop = chatLog.scrollHeight; }
  }

  if(sendChat) sendChat.addEventListener('click', ()=> {
    const t = chatInput.value.trim();
    if(!t) return;
    appendChat('You', t);
    setTimeout(()=> { appendChat('MindMend', botRespond(t)); }, 500);
    chatInput.value = '';
  });
  if(chatInput) chatInput.addEventListener('keydown', (e)=> { if(e.key === 'Enter') sendChat.click(); });

  // --- Journal (localStorage)
  const entryText = document.getElementById('entryText');
  const saveEntry = document.getElementById('saveEntry');
  const clearEntries = document.getElementById('clearEntries');
  const entriesList = document.getElementById('entriesList');

  function loadJournal(){
    const raw = localStorage.getItem('mm_entries');
    const arr = raw ? JSON.parse(raw) : [];
    if(entriesList) entriesList.innerHTML = '';
    arr.slice().reverse().forEach(en => {
      const d = document.createElement('div');
      d.className = 'entry';
      d.innerHTML = `<small class="muted">${new Date(en.t).toLocaleString()}</small><div>${escapeHtml(en.text)}</div>`;
      if(entriesList) entriesList.appendChild(d);
    });
  }

  function saveJournalEntry(text){
    const raw = localStorage.getItem('mm_entries');
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({t: Date.now(), text});
    localStorage.setItem('mm_entries', JSON.stringify(arr));
    loadJournal();
  }

  if(saveEntry) saveEntry.addEventListener('click', ()=> {
    const txt = entryText.value.trim();
    if(!txt){ alert('Write something to save.'); return; }
    saveJournalEntry(txt);
    entryText.value = '';
  });

  if(clearEntries) clearEntries.addEventListener('click', ()=> {
    if(confirm('Clear all journal entries?')) { localStorage.removeItem('mm_entries'); loadJournal(); }
  });

  function escapeHtml(s){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

  loadJournal();

  // localStorage availability check
  try { localStorage.setItem('__mm_test','1'); localStorage.removeItem('__mm_test'); }
  catch(e){ alert('Your browser blocks local storage — journal and settings will not persist.'); }

})// ⭐⭐ ADDED: Motivation Generator ⭐⭐
const quotes = [
    "You are stronger than you think!",
    "One small step every day makes big changes.",
    "Believe in yourself — you can do this.",
    "Your mind is powerful, use it well.",
    "Today is a new chance to grow."
];

function generateMotivation() {
    const text = document.getElementById("motivationText");
    text.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}
// ⭐⭐ END ADDED ⭐⭐

