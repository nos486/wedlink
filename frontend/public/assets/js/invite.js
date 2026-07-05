/* ============================================================
   WedLink — Invitation Page JavaScript (v2)
   Uses /api/public/:slug — no auth required
   Requires: auth.js loaded first (for getApiBaseUrl)
   ============================================================ */

let invitation = null;
let countdownTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  spawnParticles();
  const slug = getSlug();
  if (!slug) { showError('No invitation ID in the URL.', 'Missing Link'); return; }
  await loadInvitation(slug);
});

// ─── Load Invitation ──────────────────────────────────────────
async function loadInvitation(slug) {
  try {
    const apiBase = await getApiBaseUrl();
    const res = await fetch(`${apiBase}/api/public/${encodeURIComponent(slug)}`);
    const { success, data, error } = await res.json();
    if (!success || !data) throw new Error(error || 'Invitation not found');
    invitation = data;
    renderInvitation();
  } catch (err) {
    showError(err.message, 'Not Found');
  }
}

// ─── Render Invitation ────────────────────────────────────────
function renderInvitation() {
  document.getElementById('invite-loading').style.display = 'none';
  const content = document.getElementById('invite-main');
  content.style.display = 'block';
  content.style.animation = 'fadeIn 0.8s ease';

  document.title = `${invitation.bride} & ${invitation.groom} — WedLink`;
  document.getElementById('couple-names').textContent = `${invitation.bride} & ${invitation.groom}`;
  document.getElementById('hero-eyebrow').textContent = 'You are cordially invited to the wedding of';
  document.getElementById('detail-date').textContent = formatDate(invitation.date);
  document.getElementById('detail-venue').textContent = invitation.venue;

  const msgSection = document.getElementById('message-section');
  if (invitation.message) {
    document.getElementById('invite-message').textContent = invitation.message;
    msgSection.style.display = 'block';
  } else {
    msgSection.style.display = 'none';
  }

  startCountdown(invitation.date);
}

// ─── Countdown ────────────────────────────────────────────────
function startCountdown(dateStr) {
  const target = new Date(dateStr + 'T00:00:00').getTime();

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      document.getElementById('countdown-grid').innerHTML =
        '<div class="countdown-done">🎊 Today\'s the Day! 🎊</div>';
      clearInterval(countdownTimer);
      return;
    }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);
    setCount('cd-days', days);
    setCount('cd-hours', hours);
    setCount('cd-mins', mins);
    setCount('cd-secs', secs);
  }
  tick();
  countdownTimer = setInterval(tick, 1000);
}

function setCount(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(val).padStart(2, '0');
}

// ─── RSVP Form ────────────────────────────────────────────────
async function submitRsvp(e) {
  e.preventDefault();
  const form = e.target;

  const guest_name = form.guest_name.value.trim();
  const attending  = form.attending.value;
  const message    = form.rsvp_message.value.trim();

  if (!guest_name) { showFieldError('err-name', 'Please enter your name.'); return; }
  if (!attending)  { showFieldError('err-attend', 'Please select your attendance.'); return; }
  clearRsvpErrors();

  const btn = document.getElementById('rsvp-submit');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending…';

  try {
    const apiBase = await getApiBaseUrl();
    const res = await fetch(`${apiBase}/api/public/${invitation.slug}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest_name, attending: attending === 'yes', message: message || undefined }),
    });

    const { success, message: msg, error } = await res.json();
    if (!success) throw new Error(error);

    document.getElementById('rsvp-form-container').style.display = 'none';
    const successEl = document.getElementById('rsvp-success');
    successEl.style.display = 'block';
    successEl.querySelector('.success-message').textContent = msg;
    successEl.querySelector('.success-icon').textContent = attending === 'yes' ? '🎉' : '💌';
  } catch (err) {
    showFieldError('err-submit', 'Failed to submit: ' + err.message);
    btn.disabled = false;
    btn.innerHTML = '💌 Send RSVP';
  }
}

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function clearRsvpErrors() {
  ['err-name','err-attend','err-submit'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.style.display = 'none'; }
  });
}

// ─── Error state ──────────────────────────────────────────────
function showError(detail, title = 'Error') {
  document.getElementById('invite-loading').style.display = 'none';
  const el = document.getElementById('invite-error');
  el.style.display = 'block';
  document.getElementById('error-title').textContent = title;
  document.getElementById('error-detail').textContent = detail;
}

// ─── Particles ────────────────────────────────────────────────
function spawnParticles() {
  const container = document.getElementById('particles');
  const colors = ['#d4af37','#c9956c','#e8cc6a','#e0b08a','#f5e6d3'];
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left:${Math.random()*100}%;
      width:${2+Math.random()*4}px;
      height:${2+Math.random()*4}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${8+Math.random()*14}s;
      animation-delay:${Math.random()*10}s;
    `;
    container.appendChild(p);
  }
}

// ─── Utils ────────────────────────────────────────────────────
function getSlug() {
  const p = new URLSearchParams(window.location.search);
  return p.get('slug') || p.get('id') || '';
}
function formatDate(dateStr) {
  try { return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }); }
  catch { return dateStr; }
}

window.submitRsvp = submitRsvp;
