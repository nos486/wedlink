/* ============================================================
   WedLink — Invitation Page JavaScript
   Uses /api/public/:slug — no auth required
   Requires: auth.js loaded first (for getApiBaseUrl)
   ============================================================ */

let invitation = null;
let countdownTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  const slug = getSlug();
  if (!slug) { showError('No invitation ID in the URL.', 'Missing Link'); return; }
  await loadInvitation(slug);
});

// ─── Load Invitation ──────────────────────────────────────────
async function loadInvitation(slug) {
  try {
    const apiBase = await getApiBaseUrl();
    const res = await fetch(\`\${apiBase}/api/public/\${encodeURIComponent(slug)}\`);
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
  content.style.display = 'flex';

  applyLayout();
  window.addEventListener('resize', applyLayout);

  // Image
  const imgEl = document.getElementById('invite-image');
  const placeholderEl = document.getElementById('invite-image-placeholder');
  if (invitation.image_url) {
    imgEl.src = invitation.image_url;
    imgEl.style.display = 'block';
    placeholderEl.style.display = 'none';
  } else {
    imgEl.style.display = 'none';
    placeholderEl.style.display = 'flex';
  }

  // Text Content
  document.title = \`\${invitation.bride} & \${invitation.groom} — WedLink\`;
  document.getElementById('couple-names').textContent = \`\${invitation.bride} & \${invitation.groom}\`;
  document.getElementById('detail-date').textContent = formatDate(invitation.date);
  
  if (invitation.time) {
    document.getElementById('detail-time').textContent = invitation.time;
    document.getElementById('time-container').style.display = 'flex';
  }

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

function applyLayout() {
  if (!invitation) return;

  // Map legacy themes and layouts to the new premium ones
  const themeMap = {
    'ethereal-pearl': 'ethereal-pearl',
    'midnight-velvet': 'midnight-velvet',
    'botanic-romance': 'botanic-romance',
    'modern-minimal': 'ethereal-pearl',
    'dark-luxury': 'midnight-velvet',
    'light-floral': 'botanic-romance',
    'royal-elegance': 'midnight-velvet',
    'starlight-glamour': 'midnight-velvet',
    'enchanted-forest': 'botanic-romance'
  };

  const layoutMap = {
    'split-elegance': 'split-elegance',
    'floating-card': 'floating-card',
    'hero-cinematic': 'hero-cinematic',
    'split-left': 'split-elegance',
    'split-right': 'split-elegance',
    'polaroid-center': 'floating-card',
    'classic-card': 'floating-card',
    'hero-top': 'hero-cinematic',
    'full-overlay': 'floating-card',
    'image-top': 'hero-cinematic'
  };

  const isMobile = window.innerWidth <= 768;
  const rawLayout = isMobile ? (invitation.mobile_layout || invitation.desktop_layout || invitation.layout || 'hero-cinematic') : (invitation.desktop_layout || invitation.layout || 'split-elegance');
  
  const layoutToUse = layoutMap[rawLayout] || 'split-elegance';
  const themeToUse = themeMap[invitation.theme] || 'midnight-velvet';
  
  document.getElementById('invite-body').className = \`invite-page theme-\${themeToUse} layout-\${layoutToUse}\`;
}

// ─── Countdown ────────────────────────────────────────────────
function startCountdown(dateStr) {
  const target = new Date(dateStr + 'T00:00:00').getTime();

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      document.getElementById('countdown-grid').innerHTML =
        \`<div style="grid-column:1/-1;text-align:center;font-size:24px;font-family:var(--inv-font-script);color:var(--inv-accent);display:flex;align-items:center;justify-content:center;gap:12px;">
           <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
           Today is the Day!
           <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
         </div>\`;
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

// ─── Error state ──────────────────────────────────────────────
function showError(detail, title = 'Error') {
  document.getElementById('invite-loading').style.display = 'none';
  const el = document.getElementById('invite-error');
  el.style.display = 'flex';
  document.getElementById('error-title').textContent = title;
  document.getElementById('error-detail').textContent = detail;
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
