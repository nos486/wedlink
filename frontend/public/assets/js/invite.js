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

  const lang = getLang();

  // Set direction and language
  const body = document.getElementById('invite-body');
  if (lang === 'fa') {
    body.setAttribute('dir', 'rtl');
  } else {
    body.removeAttribute('dir');
  }

  // Configure Language Switcher Button
  const otherLang = lang === 'en' ? 'fa' : 'en';
  const otherLangLabel = lang === 'en' ? 'فارسی' : 'English';
  
  const switcherUrl = new URL(window.location.href);
  switcherUrl.searchParams.set('lang', otherLang);

  const langText = document.getElementById('lang-text');
  const langSwitcher = document.getElementById('lang-switcher');
  
  if (langText) langText.textContent = otherLangLabel;
  if (langSwitcher) langSwitcher.href = switcherUrl.toString();

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

  // Names, Venue, Message (bilingual check)
  const brideName = (lang === 'fa' && invitation.bride_fa) ? invitation.bride_fa : invitation.bride;
  const groomName = (lang === 'fa' && invitation.groom_fa) ? invitation.groom_fa : invitation.groom;
  const venueText = (lang === 'fa' && invitation.venue_fa) ? invitation.venue_fa : invitation.venue;
  const messageText = (lang === 'fa' && invitation.message_fa) ? invitation.message_fa : invitation.message;

  const joinedNames = `${brideName} ${lang === 'fa' ? 'و' : '&'} ${groomName}`;
  const formattedDate = lang === 'fa' ? formatFaDate(invitation.date) : formatDate(invitation.date);

  document.title = `${brideName} & ${groomName} — WedLink`;
  document.getElementById('couple-names-front').textContent = joinedNames;
  document.getElementById('couple-names-back').textContent = joinedNames;
  
  // Date format based on lang
  document.getElementById('detail-date-front').textContent = formattedDate;
  document.getElementById('detail-date').textContent = formattedDate;
  
  if (invitation.time) {
    const timeStr = lang === 'fa' ? toPersianDigits(invitation.time) : invitation.time;
    document.getElementById('detail-time').textContent = timeStr;
    document.getElementById('time-container').style.display = 'flex';
  } else {
    document.getElementById('time-container').style.display = 'none';
  }

  document.getElementById('detail-venue').textContent = venueText;

  // Eyebrow translation
  const eyebrowEls = document.querySelectorAll('.inv-eyebrow');
  eyebrowEls.forEach(el => {
    el.textContent = lang === 'fa' 
      ? 'با کمال مسرت شما را به جشن ازدواج خود دعوت می‌نماییم' 
      : 'You are cordially invited to the wedding of';
  });

  // Flip button text translation
  const flipBtnText = document.getElementById('flip-btn-text');
  if (flipBtnText) {
    flipBtnText.textContent = lang === 'fa' ? 'چرخش کارت' : 'Flip Card';
  }

  const msgSection = document.getElementById('message-section');
  if (messageText) {
    document.getElementById('invite-message').textContent = messageText;
    msgSection.style.display = 'block';
  } else {
    msgSection.style.display = 'none';
  }

  // Translate countdown labels
  const labels = document.querySelectorAll('.cd-lbl');
  if (labels.length === 3) {
    if (lang === 'fa') {
      labels[0].textContent = 'روز';
      labels[1].textContent = 'ساعت';
      labels[2].textContent = 'دقیقه';
    } else {
      labels[0].textContent = 'Days';
      labels[1].textContent = 'Hours';
      labels[2].textContent = 'Mins';
    }
  }

  setupCardRotation();
  setupCardParallax();
  startCountdown(invitation.date);
}

function applyLayout() {
  if (!invitation) return;
  const isMobile = window.innerWidth <= 768;
  const desktopLayout = invitation.desktop_layout || '3d-horizontal';
  const mobileLayout = invitation.mobile_layout || '3d-horizontal';
  
  let layoutToUse = isMobile ? mobileLayout : desktopLayout;
  if (layoutToUse === '3d-card' || !layoutToUse.startsWith('3d-')) {
    layoutToUse = '3d-horizontal';
  }
  
  const themeToUse = invitation.theme || 'modern-minimal';
  const body = document.getElementById('invite-body');
  const dir = body.getAttribute('dir') || '';
  body.className = `invite-page theme-${themeToUse} layout-${layoutToUse}`;
  if (dir) body.setAttribute('dir', dir);
}

// ─── Countdown ────────────────────────────────────────────────
function startCountdown(dateStr) {
  const target = new Date(dateStr + 'T00:00:00').getTime();
  const lang = getLang();

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      const todayMsg = lang === 'fa' ? 'امروز روز موعود است! 🎊' : "Today's the Day!";
      document.getElementById('countdown-grid').innerHTML =
        `<div style="grid-column:1/-1;text-align:center;font-size:24px;font-family:var(--inv-font-script);color:var(--inv-accent); display:inline-flex; align-items:center; justify-content:center; gap:8px;">
           <svg class="svg-icon" style="width:24px;height:24px;" viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8"></path></svg>
           ${todayMsg}
           <svg class="svg-icon" style="width:24px;height:24px;" viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8"></path></svg>
         </div>`;
      clearInterval(countdownTimer);
      return;
    }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    
    // Format numerals to Persian if lang=fa
    setCount('cd-days', lang === 'fa' ? toPersianDigits(days) : days);
    setCount('cd-hours', lang === 'fa' ? toPersianDigits(hours) : hours);
    setCount('cd-mins', lang === 'fa' ? toPersianDigits(mins) : mins);
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

function getLang() {
  const p = new URLSearchParams(window.location.search);
  const lang = p.get('lang') || 'en';
  return lang.toLowerCase() === 'fa' ? 'fa' : 'en';
}

function formatDate(dateStr) {
  try { return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }); }
  catch { return dateStr; }
}

function formatFaDate(dateStr) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function toPersianDigits(val) {
  const fa = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(val).replace(/[0-9]/g, w => fa[+w]);
}

// ─── 3D Card Rotation ─────────────────────────────────────────
function setupCardRotation() {
  const card = document.getElementById('invitation-card');
  const flipBtn = document.getElementById('flip-btn');
  if (!card) return;

  if (flipBtn) {
    flipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.toggle('flipped');
    });
  }

  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
}

function setupCardParallax() {
  const perspective = document.querySelector('.card-perspective');
  const card = document.getElementById('invitation-card');
  if (!perspective || !card) return;

  // Track hover and tilt card
  perspective.addEventListener('mousemove', (e) => {
    // Disable hover tilt when card is flipped to maintain details readability
    if (card.classList.contains('flipped')) return;

    const rect = perspective.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Smooth 3D tilt max 8 degrees
    const tiltX = -(y / (rect.height / 2)) * 8;
    const tiltY = (x / (rect.width / 2)) * 8;
    
    card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });

  perspective.addEventListener('mouseleave', () => {
    // Let stylesheet values take over when not hovered
    if (card.classList.contains('flipped')) return;
    card.style.transform = '';
  });
}
