'use strict';

// ══════════════════════════════════════════════════
// 1. CANVAS — LIVE CODE RAIN BACKGROUND
// ══════════════════════════════════════════════════
var canvas = document.getElementById('canvas-bg');
var ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', function() { resize(); initColumns(); });

var SNIPPETS = [
  'const dev = new Developer("F.R.Arnav");',
  'function init() { return Promise.resolve(); }',
  'import { useState, useEffect } from "react";',
  'git commit -m "feat: corvus-browser v1.0"',
  'npm run build && npm run deploy',
  'SELECT * FROM projects WHERE status="active";',
  'docker-compose up --build -d',
  'ssh arnav@dev.server.local',
  'export default function App() {',
  '  return <Terminal theme="green" />;',
  'while (alive) { code(); learn(); build(); }',
  'const res = await fetch("/v1/completions");',
  'pip install anthropic openai transformers',
  'if (err) throw new Error("debug_mode_on");',
  '// TODO: world domination via clean code',
  'class Neural { train(data) { /* magic */ } }',
  'yarn add --dev tailwindcss postcss autoprefixer',
  '.env: ANTHROPIC_API_KEY=sk-ant-...',
  'console.log("corvus:", Date.now());',
  'grep -r "TODO" ./src --include="*.ts"',
  'git push origin feature/corvus-theme',
  'interface Dev { name: string; level: "elite"; }',
  'fn main() -> Result<(), Box<dyn Error>> {',
  'print(f"Hello, {dev_name}")',
  'chmod +x ./deploy.sh && ./deploy.sh',
  'ls -la /home/arnav/projects/',
];

var RAIN_COLORS = [
  'rgba(0,255,136,',
  'rgba(0,229,255,',
  'rgba(255,183,0,',
  'rgba(191,95,255,',
];

var columns = [];
var COL_W = 14, FS = 11;

function initColumns() {
  columns = [];
  var count = Math.ceil(canvas.width / COL_W) + 2;
  for (var i = 0; i < count; i++) {
    columns.push({
      x:       i * COL_W,
      y:       Math.random() * -800,
      speed:   0.4 + Math.random() * 0.9,
      snippet: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)],
      charIdx: 0,
      color:   RAIN_COLORS[Math.floor(Math.random() * RAIN_COLORS.length)],
      alpha:   0.08 + Math.random() * 0.28,
      delay:   Math.floor(Math.random() * 200),
    });
  }
}
initColumns();

var frameCount = 0;
function drawBg() {
  ctx.fillStyle = 'rgba(10,12,15,0.13)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = FS + "px 'JetBrains Mono', monospace";

  for (var i = 0; i < columns.length; i++) {
    var col = columns[i];
    if (frameCount < col.delay) continue;

    var chars = col.snippet.split('');
    var cx = col.x, cy = col.y;

    for (var ci = 0; ci < Math.floor(col.charIdx) && ci < chars.length; ci++) {
      var a = ci === Math.floor(col.charIdx) - 1
        ? col.alpha * 1.8
        : col.alpha * (0.3 + 0.7 * (ci / chars.length));
      ctx.fillStyle = col.color + Math.min(1, a) + ')';
      ctx.fillText(chars[ci], cx, cy);
      cx += FS * 0.6;
      if (cx > canvas.width) { cx = col.x; cy += FS + 3; }
    }

    col.charIdx += col.speed;

    if (col.charIdx >= col.snippet.length + 5) {
      col.y      += (FS + 4) * Math.ceil(col.snippet.length / Math.max(1, Math.floor((canvas.width - col.x) / (FS * 0.6))));
      col.charIdx = 0;
      col.snippet = SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)];
      col.alpha   = 0.08 + Math.random() * 0.28;
    }
    if (col.y > canvas.height + 200) {
      col.y       = -100 - Math.random() * 400;
      col.snippet = SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)];
      col.charIdx = 0;
    }
  }

  frameCount++;
  requestAnimationFrame(drawBg);
}
drawBg();


// ══════════════════════════════════════════════════
// 2. CLOCK, DATE, UPTIME
// ══════════════════════════════════════════════════
var SESSION_START = Date.now();
var DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
var MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function pad(n) { return String(n).padStart(2, '0'); }

function tick() {
  var now     = new Date();
  var clockEl = document.getElementById('clock');
  var dateEl  = document.getElementById('date-str');
  var upEl    = document.getElementById('uptime-str');

  if (clockEl) clockEl.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
  if (dateEl)  dateEl.textContent  = DAYS[now.getDay()] + '  ' + pad(now.getDate()) + ' ' + MONTHS[now.getMonth()] + ' ' + now.getFullYear();

  if (upEl) {
    var secs = Math.floor((Date.now() - SESSION_START) / 1000);
    upEl.textContent = 'UPTIME: ' + pad(Math.floor(secs / 3600)) + ':' + pad(Math.floor((secs % 3600) / 60)) + ':' + pad(secs % 60);
  }
}
setInterval(tick, 1000);
tick(); // run immediately so it shows on load


// ══════════════════════════════════════════════════
// 3. BATTERY
// ══════════════════════════════════════════════════
function renderBat(bat) {
  var el = document.getElementById('bat-val');
  if (!el) return;
  function update() {
    var pct = Math.round(bat.level * 100);
    el.textContent = (bat.charging ? '⚡ ' : '') + pct + '%';
    el.className   = pct > 50 ? 'ok' : pct > 20 ? 'warn' : 'err';
  }
  update();
  bat.addEventListener('levelchange',    update);
  bat.addEventListener('chargingchange', update);
}

if (navigator.getBattery) {
  navigator.getBattery().then(renderBat).catch(function() {
    var el = document.getElementById('bat-val');
    if (el) el.textContent = 'N/A';
  });
} else {
  var el = document.getElementById('bat-val');
  if (el) el.textContent = 'N/A';
}


// ══════════════════════════════════════════════════
// 4. SEARCH — opens in new tab (correct for extensions)
// ══════════════════════════════════════════════════
var activeEngine = 'https://www.google.com/search?q=';

// Engine buttons — stopPropagation so global click handler doesn't fire
var engineBtns = document.querySelectorAll('.engine-btn');
engineBtns.forEach(function(btn) {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    engineBtns.forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    activeEngine = btn.dataset.engine;
    document.getElementById('search').focus();
  });
});

var searchEl = document.getElementById('search');
searchEl.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  var q = searchEl.value.trim();
  if (!q) return;

  var url;
  if (/^https?:\/\//i.test(q)) {
    url = q;
  } else if (/^[a-zA-Z0-9]([a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}(\/|$)/.test(q) && !q.includes(' ')) {
    url = 'https://' + q;
  } else {
    url = activeEngine + encodeURIComponent(q);
  }

  window.open(url, '_blank');   // open in new tab — correct for Chrome extensions
  searchEl.value = '';
});

// Auto-focus search when user starts typing (not inside another input)
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.length !== 1) return;
  var active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
  searchEl.focus();
});


// ══════════════════════════════════════════════════
// 5. LINK CLICKS — open in new tab
//    Only fires on <a> tags (NOT on buttons/engine-btns)
// ══════════════════════════════════════════════════
document.addEventListener('click', function(e) {
  // Ignore if it's a button or inside the search/engine area
  if (e.target.closest('button')) return;
  var a = e.target.closest('a[href]');
  if (!a) return;
  var href = a.getAttribute('href');
  if (!href || href.startsWith('#')) return;
  e.preventDefault();
  window.open(href, '_blank');
});


// ══════════════════════════════════════════════════
// 6. DYNAMIC NAME — double-click greeting to set name
// ══════════════════════════════════════════════════
(function() {
  var nameEl = document.getElementById('user-name');
  if (!nameEl) return;

  // Load saved name
  var saved = '';
  try { saved = localStorage.getItem('corvus-username') || ''; } catch(e) {}
  if (saved) nameEl.textContent = saved;

  nameEl.style.cursor = 'pointer';
  nameEl.title = 'Double-click to change your name';

  nameEl.addEventListener('dblclick', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var currentName = nameEl.textContent;
    var inputEl = document.createElement('input');
    inputEl.type  = 'text';
    inputEl.value = currentName;
    inputEl.style.cssText = [
      'background: transparent',
      'border: none',
      'border-bottom: 2px solid #00ff88',
      'color: #00ff88',
      'font-family: inherit',
      'font-size: inherit',
      'font-weight: inherit',
      'letter-spacing: inherit',
      'outline: none',
      'min-width: 60px',
      'width: ' + Math.max(80, nameEl.offsetWidth + 40) + 'px',
      'text-align: center',
      'text-shadow: 0 0 20px rgba(0,255,136,0.5)',
      'padding: 0 4px',
      '-webkit-user-select: text',
      'user-select: text',
    ].join(';');

    nameEl.style.display = 'none';
    nameEl.insertAdjacentElement('afterend', inputEl);
    inputEl.focus();
    inputEl.select();

    var done = false;
    function commit() {
      if (done) return;
      done = true;
      var val = inputEl.value.trim() || currentName;
      nameEl.textContent = val;
      try { localStorage.setItem('corvus-username', val); } catch(err) {}
      inputEl.remove();
      nameEl.style.display = '';
    }

    inputEl.addEventListener('keydown', function(ev) {
      if (ev.key === 'Enter' || ev.key === 'Escape') { ev.preventDefault(); commit(); }
    });
    inputEl.addEventListener('blur', function() {
      setTimeout(commit, 100); // slight delay so Enter doesn't double-fire
    });
  });
})();
