// ── SOCKET.IO CONNECTION TO PYTHON BACKEND ──
const socket = io('http://127.0.0.1:5000');
 
socket.on('connect', () => {
  addLog('BACKEND CONNECTED');
  console.log('Connected to Jarvis backend');
});
 
socket.on('disconnect', () => {
  addLog('BACKEND DISCONNECTED');
});
 
socket.on('jarvis_thinking', () => {
  document.getElementById('arc-status').textContent = 'PROCESSING VIA AI CORE...';
  addLog('AI CORE PROCESSING...');
});

socket.on('jarvis_response', (data) => {
  showResponse(data.text, lastInput);
  document.getElementById('arc-status').textContent = 'RESPONSE READY';
  speakText(data.text);

  // ✅ Wait for TTS to finish then restart mic
  const ttsDelay = (data.text.length * 55) + 800;
  setTimeout(() => {
    if (!manualStop) {
      manualStop = false;
      startVoiceRecognition();
      addLog('AUTO-LISTEN RESTARTED');
    }
  }, ttsDelay);
});

socket.on('listening_started', () => {
  addLog('BACKEND LISTENING ACTIVE');
});
 
socket.on('user_spoke', (data) => {
  document.getElementById('transcript-text').textContent = data.text;
  addLog('INPUT: ' + data.text.toUpperCase());
});
 
// ── BOOT SEQUENCE ──
setTimeout(() => {
  document.getElementById('boot').classList.add('hidden');
  setTimeout(() => document.getElementById('boot').remove(), 1000);
}, 2800);
 
// ── CLOCK ──
function updateClock() {
  const now = new Date();
  document.getElementById('clock-display').textContent =
    now.toTimeString().slice(0,8) + ' IST';
}
setInterval(updateClock, 1000);
updateClock();
 
// ── UPTIME ──
let startTime = Date.now();
setInterval(() => {
  const s = Math.floor((Date.now() - startTime) / 1000);
  const h = String(Math.floor(s/3600)).padStart(2,'0');
  const m = String(Math.floor((s%3600)/60)).padStart(2,'0');
  const sec = String(s%60).padStart(2,'0');
  document.getElementById('uptime-val').textContent = `${h}:${m}:${sec}`;
}, 1000);
 
// ── BUILD WAVEFORM ──
const wf = document.getElementById('waveform');
for (let i = 0; i < 32; i++) {
  const b = document.createElement('div');
  b.className = 'wave-bar';
  b.style.animationDelay = (Math.random() * 1.5) + 's';
  b.style.height = (Math.random() * 8 + 4) + 'px';
  wf.appendChild(b);
}
 
// ── BUILD MINI CHART ──
const mc = document.getElementById('mini-chart');
for (let i = 0; i < 20; i++) {
  const b = document.createElement('div');
  b.className = 'mini-bar';
  b.style.height = (Math.random() * 32 + 4) + 'px';
  b.style.animationDelay = (i * 0.1) + 's';
  mc.appendChild(b);
}
 
// ── SIMULATED METRICS ──
function jitter(val, range) {
  return Math.min(100, Math.max(5, val + (Math.random() - 0.5) * range));
}
let metrics = { cpu: 94, mem: 71, net: 88, vox: 100 };
setInterval(() => {
  metrics.cpu = jitter(metrics.cpu, 6);
  metrics.mem = jitter(metrics.mem, 4);
  metrics.net = jitter(metrics.net, 8);
  ['cpu','mem','net','vox'].forEach(k => {
    document.getElementById(`${k}-val`).textContent = Math.round(metrics[k]) + '%';
    document.getElementById(`${k}-bar`).style.width = metrics[k] + '%';
  });
  const pw = (3 + (Math.random()-0.5)*0.2).toFixed(2);
  document.getElementById('power-display').textContent = pw + ' GW';
}, 2000);
 
// ── CONFIDENCE ──
function setConf(v) {
  document.getElementById('conf-val').textContent = v + '%';
}
 
// ── LOG SYSTEM ──
const LOG_INIT = [
  'SYSTEM BOOT COMPLETE',
  'VOICE ENGINE LOADED',
  'SPEECH RECOGNIZER READY',
  'AI INTERFACE ONLINE',
  'AWAITING COMMANDS',
];
LOG_INIT.forEach((m, i) => setTimeout(() => addLog(m), 3200 + i * 300));
 
let queryCount = 0;
function addLog(msg) {
  const list = document.getElementById('log-list');
  const t = new Date().toTimeString().slice(0,8);
  const el = document.createElement('div');
  el.className = 'log-entry new';
  el.innerHTML = `<span class="log-time">${t}</span><span class="log-msg">${msg}</span>`;
  list.insertBefore(el, list.firstChild);
  setTimeout(() => el.classList.remove('new'), 2000);
  while (list.children.length > 20) list.removeChild(list.lastChild);
}
 
// ── COMMAND TAGS ──
const KNOWN_CMDS = ['TIME','OPEN NOTEPAD','OPEN CHROME','OPEN GOOGLE','YOUTUBE','JOKE','WHO ARE YOU','HOW ARE YOU'];
const tagContainer = document.getElementById('cmd-tags');
KNOWN_CMDS.forEach(c => {
  const t = document.createElement('div');
  t.style.cssText = 'font-family:Share Tech Mono,monospace;font-size:0.52rem;letter-spacing:0.1em;color:var(--dim);border:1px solid #0a2535;padding:3px 7px;background:rgba(0,15,26,0.5);';
  t.textContent = c;
  tagContainer.appendChild(t);
});
 
// ── STATUS / WAVEFORM HELPERS ──
let isListening = false;
let lastInput = '';
 
function setListening(on) {
  isListening = on;
  const core = document.getElementById('core');
  const micBtn = document.getElementById('mic-btn');
  const wave = document.getElementById('waveform');
  const status = document.getElementById('arc-status');
  if (on) {
    core.classList.add('active');
    micBtn.classList.add('active');
    wave.classList.remove('idle');
    status.textContent = 'LISTENING — VOICE INPUT ACTIVE';
    addLog('MIC ACTIVATED');
  } else {
    core.classList.remove('active');
    micBtn.classList.remove('active');
    wave.classList.add('idle');
    status.textContent = 'STANDBY — AWAITING INPUT';
  }
}
 
function toggleListen() {
  if (isRecognizing || isListening) {
    manualStop = true;
    if (recognition) recognition.stop();
    setListening(false);
    addLog('MIC MANUALLY STOPPED');
  } else {
    manualStop = false;
    startVoiceRecognition();
    addLog('MIC MANUALLY STARTED');
  }
}
 
// ── TEXT I/O ──
function showResponse(text, input) {
  queryCount++;
  document.getElementById('query-count').textContent = queryCount;
  document.getElementById('response-text').textContent = text;
  if (input) document.getElementById('transcript-text').textContent = input;
  addLog('RESPONSE RECEIVED FROM BACKEND');
}
 
function sendText() {
  const inp = document.getElementById('text-input');
  const val = inp.value.trim();
  if (!val) return;
  inp.value = '';
  processCommand(val);
}
document.getElementById('text-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendText();
});
 
// ── COMMAND PROCESSOR — sends to Python backend via WebSocket ──
function processCommand(cmd) {
  lastInput = cmd;
  addLog('INPUT: ' + cmd.toUpperCase());
  setConf(Math.floor(85 + Math.random() * 15));
  document.getElementById('arc-status').textContent = 'SENDING TO AI CORE...';
 
  // ✅ Send to Python backend instead of processing locally
  socket.emit('user_input', { text: cmd });
}
 
// ── TTS (Browser speaks Python's response) ──
function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const pref = voices.find(v => v.name.toLowerCase().includes('google uk english male'))
             || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
             || voices.find(v => v.lang.startsWith('en'))
             || null;
  if (pref) utt.voice = pref;
  utt.rate = 0.95;
  utt.pitch = 0.85;
  utt.volume = 1;
  window.speechSynthesis.speak(utt);
}
window.speechSynthesis.onvoiceschanged = () => {};
 
// ── PREVENT CLICKS FROM STOPPING RECOGNITION ──
//document.addEventListener('click', (e) => {
  // If clicking anything other than the mic button, ignore and restart if needed
  //if (e.target.id !== 'mic-btn') {
    //e.stopPropagation();
    //setTimeout(() => {
      //if (!isListening) {
        //setListening(true);
        //startVoiceRecognition();
      //}
    //}, 300);
  //}
//});

// ── VOICE RECOGNITION (Browser mic → sends to Python backend) ──
let recognition = null;
let manualStop = false;
let isRecognizing = false; // prevents overlapping instances

function startVoiceRecognition() {
  if (isRecognizing) return; // prevent double-start

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    addLog('VOICE RECOGNITION NOT SUPPORTED');
    return;
  }

  recognition = new SR();
  recognition.lang = 'en-IN';
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    isRecognizing = true;
    setListening(true);
    addLog('LISTENING...');
  };

  recognition.onspeechstart = () => {
    // ✅ Turn circle red when voice is detected
    document.getElementById('core').style.boxShadow = '0 0 40px 10px red';
    document.getElementById('arc-status').textContent = 'VOICE DETECTED...';
    addLog('VOICE DETECTED');
  };

  recognition.onspeechend = () => {
    // ✅ Revert circle when voice stops
    document.getElementById('core').style.boxShadow = '';
    document.getElementById('arc-status').textContent = 'PROCESSING...';
  };

  recognition.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
    document.getElementById('transcript-text').textContent = transcript;
    if (e.results[e.results.length - 1].isFinal) {
      processCommand(transcript);
    }
  };

  recognition.onerror = (e) => {
    isRecognizing = false;
    addLog('VOICE ERROR: ' + e.error.toUpperCase());
    // Auto restart on common non-fatal errors
    if (e.error === 'no-speech' || e.error === 'audio-capture' || e.error === 'network') {
      setTimeout(() => {
        if (!manualStop) startVoiceRecognition();
      }, 1000);
    }
  };

  recognition.onend = () => {
    isRecognizing = false;
    document.getElementById('core').style.boxShadow = ''; // reset color
    if (!manualStop) {
      // ✅ Always restart unless manually stopped
      setTimeout(() => startVoiceRecognition(), 500);
    } else {
      setListening(false);
      manualStop = false;
    }
  };

  try {
    recognition.start();
  } catch(e) {
    isRecognizing = false;
    console.error('Recognition start error:', e);
    setTimeout(() => startVoiceRecognition(), 1000);
  }
}
 
// ── CLEAR / RESET ──
function clearLog() {
  document.getElementById('log-list').innerHTML = '';
  addLog('LOG CLEARED');
}
function resetSystem() {
  if (recognition) recognition.stop();
  setListening(false);
  queryCount = 0;
  document.getElementById('query-count').textContent = '0';
  document.getElementById('response-text').textContent = "Hello, Ma'am. All systems are online. How may I assist you today?";
  document.getElementById('transcript-text').textContent = '';
  clearLog();
  addLog('SYSTEM RESET COMPLETE');
  setConf(100);
}

// ── AUTO START LISTENING ON PAGE LOAD ──
//window.addEventListener('load', () => {
  // Wait for boot sequence to finish (2800ms) then auto-start
  //setTimeout(() => {
    //addLog('AUTO-LISTEN ACTIVATED');
    //setListening(true);
    //startVoiceRecognition();
  //}, 3500); // starts just after boot animation ends
//});
window.addEventListener('load', () => {
  setTimeout(() => {
    manualStop = false;
    startVoiceRecognition();
    addLog('AUTO-LISTEN ACTIVATED');
  }, 3500);
});