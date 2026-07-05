/* ============================================================
   WedLink — Invitation Page JavaScript (v3: Themes & Layouts)
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
    placeholderEl.style.display = 'block';
  }

  // Text Content
  document.title = `${invitation.bride} & ${invitation.groom} — WedLink`;
  document.getElementById('couple-names').textContent = `${invitation.bride} & ${invitation.groom}`;
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
  const isMobile = window.innerWidth <= 768;
  const desktopLayout = invitation.desktop_layout || invitation.layout || 'split-left';
  const mobileLayout = invitation.mobile_layout || invitation.layout || 'hero-top';
  
  const layoutToUse = isMobile ? mobileLayout : desktopLayout;
  const themeToUse = invitation.theme || 'modern-minimal';
  
  document.getElementById('invite-body').className = `invite-page theme-${themeToUse} layout-${layoutToUse}`;
}

// ─── Countdown ────────────────────────────────────────────────
function startCountdown(dateStr) {
  const target = new Date(dateStr + 'T00:00:00').getTime();

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      document.getElementById('countdown-grid').innerHTML =
        `<div style="grid-column:1/-1;text-align:center;font-size:24px;font-family:var(--inv-font-script);color:var(--inv-accent); display:inline-flex; align-items:center; justify-content:center; gap:8px;">
           <svg class="svg-icon" style="width:24px;height:24px;" viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8"></path></svg>
           Today's the Day!
           <svg class="svg-icon" style="width:24px;height:24px;" viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8"></path></svg>
         </div>`;
      clearInterval(countdownTimer);
      return;
    }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    setCount('cd-days', days);
    setCount('cd-hours', hours);
    setCount('cd-mins', mins);
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
