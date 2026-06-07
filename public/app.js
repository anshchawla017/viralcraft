// ── STATE ──
let activePlat = 'Instagram Reels';
let activeAudience = '';
const tips = [
  'Analyzing top performing content...',
  'Crafting scroll-stopping hooks...',
  'Optimizing for the algorithm...',
  'Building your hashtag strategy...',
  'Writing your script outline...',
];

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  // Platform buttons
  document.querySelectorAll('.plat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.plat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePlat = btn.dataset.plat;
    });
  });

  // Audience pills
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      if (pill.classList.contains('active')) {
        pill.classList.remove('active');
        activeAudience = '';
      } else {
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeAudience = pill.dataset.val;
      }
    });
  });

  // Char count
  const topic = document.getElementById('topic');
  const charCount = document.getElementById('charCount');
  topic.addEventListener('input', () => {
    const len = topic.value.length;
    charCount.textContent = `${len} / 300`;
    charCount.style.color = len > 280 ? 'var(--red)' : 'var(--text3)';
    if (len > 300) topic.value = topic.value.slice(0, 300);
  });

  // Result tabs
  document.querySelectorAll('.rtab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.rtab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.rtab-content').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });
});

// ── SCROLL TO GEN ──
function scrollToGen() {
  document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => document.getElementById('topic').focus(), 600);
}

// ── COPY ──
function copyText(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✓ Copied';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ── SHOW STATES ──
function showEmpty() {
  document.getElementById('emptyState').style.display = 'flex';
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('resultsState').style.display = 'none';
}
function showLoading() {
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('loadingState').style.display = 'flex';
  document.getElementById('resultsState').style.display = 'none';

  let i = 0;
  const tipEl = document.getElementById('loadingTip');
  tipEl.textContent = tips[0];
  window._tipInterval = setInterval(() => {
    i = (i + 1) % tips.length;
    tipEl.textContent = tips[i];
  }, 1200);
}
function showResults() {
  clearInterval(window._tipInterval);
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('resultsState').style.display = 'block';
}

// ── SCORE COLOR ──
function scoreColor(score) {
  if (score >= 80) return 'var(--green)';
  if (score >= 60) return 'var(--yellow)';
  return 'var(--red)';
}
function scoreLabel(score) {
  if (score >= 85) return '🔥 Highly viral';
  if (score >= 70) return '⚡ Strong potential';
  if (score >= 55) return '📈 Good reach';
  return '🌱 Needs tweaking';
}

// ── BUILD RESULT CARDS ──
function buildHooks(hooks) {
  return hooks.map((h, i) => {
    const id = 'hook_' + i;
    return `<div class="result-card">
      <div class="rc-label">Hook ${i + 1}</div>
      <button class="copy-btn" onclick="copyText(this, document.getElementById('${id}').innerText)">Copy</button>
      <div class="rc-text" id="${id}">${escHtml(h.hook)}</div>
      <div class="rc-why">💡 ${escHtml(h.why)}</div>
    </div>`;
  }).join('');
}

function buildCaption(caption) {
  const id = 'caption_text';
  return `<div class="result-card">
    <div class="rc-label">Full caption</div>
    <button class="copy-btn" onclick="copyText(this, document.getElementById('${id}').innerText)">Copy</button>
    <div class="rc-text" id="${id}">${escHtml(caption)}</div>
  </div>`;
}

function buildHashtags(hashtags) {
  const groups = [
    { key: 'high_volume', label: '🟢 High volume — broad reach', cls: 'high' },
    { key: 'mid_volume',  label: '🟡 Mid volume — sweet spot',   cls: 'mid'  },
    { key: 'niche',       label: '🟣 Niche — targeted audience', cls: 'niche'},
  ];
  return groups.map(g => {
    const tags = (hashtags[g.key] || []).map(t =>
      `<span class="htag ${g.cls}" onclick="copyText(this, '#${t.replace('#','')}')">#${escHtml(t.replace('#',''))}</span>`
    ).join('');
    return `<div class="hashtag-group">
      <div class="hashtag-group-label">${g.label}</div>
      <div class="tags-wrap">${tags}</div>
    </div>`;
  }).join('');
}

function buildScript(outline) {
  const id = 'script_text';
  return `<div class="result-card">
    <div class="rc-label">Script / content outline</div>
    <button class="copy-btn" onclick="copyText(this, document.getElementById('${id}').innerText)">Copy</button>
    <div class="rc-text" id="${id}">${escHtml(outline)}</div>
  </div>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/\n/g,'<br>');
}

// ── MAIN GENERATE ──
async function generate() {
  const topic = document.getElementById('topic').value.trim();
  const niche  = document.getElementById('niche').value.trim();
  const tone   = document.getElementById('tone').value;
  const errorBox = document.getElementById('errorBox');
  const genBtn   = document.getElementById('generateBtn');

  errorBox.style.display = 'none';

  if (!topic) {
    errorBox.textContent = '⚠ Please describe what your content is about.';
    errorBox.style.display = 'block';
    document.getElementById('topic').focus();
    return;
  }

  genBtn.disabled = true;
  document.querySelector('.btn-text').style.display = 'none';
  document.querySelector('.btn-loader').style.display = 'inline';
  showLoading();

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, niche, tone, platform: activePlat, audience: activeAudience })
    });

    const d = await res.json();

    if (d.error) throw new Error(d.error);

    // Score banner
    const sc = Math.min(100, Math.max(0, parseInt(d.viral_score) || 70));
    document.getElementById('scoreNum').textContent   = sc;
    document.getElementById('scoreCircle').style.borderColor = scoreColor(sc);
    document.getElementById('scoreCircle').style.color = scoreColor(sc);
    document.getElementById('scoreLabel').textContent  = scoreLabel(sc);
    document.getElementById('statTime').textContent   = d.best_time || '—';
    document.getElementById('statReach').textContent  = d.estimated_reach || '—';

    // Tabs
    document.getElementById('tab-hooks').innerHTML    = buildHooks(d.hooks || []);
    document.getElementById('tab-caption').innerHTML  = buildCaption(d.caption || '');
    document.getElementById('tab-hashtags').innerHTML = buildHashtags(d.hashtags || {});
    document.getElementById('tab-script').innerHTML   = buildScript(d.script_outline || '');

    // Reset to hooks tab
    document.querySelectorAll('.rtab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.rtab-content').forEach(t => t.classList.remove('active'));
    document.querySelector('.rtab[data-tab="hooks"]').classList.add('active');
    document.getElementById('tab-hooks').classList.add('active');

    showResults();
    document.getElementById('outputPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    showEmpty();
    errorBox.textContent = '⚠ Something went wrong. Please try again.';
    errorBox.style.display = 'block';
    console.error(err);
  }

  genBtn.disabled = false;
  document.querySelector('.btn-text').style.display = 'inline';
  document.querySelector('.btn-loader').style.display = 'none';
}
