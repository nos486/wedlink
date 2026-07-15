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
  const langText = document.getElementById('lang-text');
  const langSwitcher = document.getElementById('lang-switcher');
  const otherLang = lang === 'en' ? 'fa' : 'en';
  const otherLangLabel = lang === 'en' ? 'فارسی' : 'English';
  
  langText.textContent = otherLangLabel;
  const switcherUrl = new URL(window.location.href);
  switcherUrl.searchParams.set('lang', otherLang);
  langSwitcher.href = switcherUrl.toString();

  // Image
  const imgEl = document.getElementById('invite-image');
  const placeholderEl = document.getElementById('invite-image-placeholder');
  const bgBlurEl = document.getElementById('invite-bg-blur');
  if (invitation.image_url) {
    imgEl.src = invitation.image_url;
    imgEl.style.display = 'block';
    placeholderEl.style.display = 'none';
    if (bgBlurEl) {
      bgBlurEl.style.backgroundImage = `url('${invitation.image_url}')`;
      bgBlurEl.style.display = 'block';
    }
  } else {
    imgEl.style.display = 'none';
    placeholderEl.style.display = 'block';
    if (bgBlurEl) {
      bgBlurEl.style.display = 'none';
    }
  }

  // Names, Family, Venue, Message (bilingual check)
  const brideName = (lang === 'fa' && invitation.bride_fa) ? invitation.bride_fa : invitation.bride;
  const groomName = (lang === 'fa' && invitation.groom_fa) ? invitation.groom_fa : invitation.groom;
  const brideFamily = (lang === 'fa' && invitation.bride_family_fa) ? invitation.bride_family_fa : invitation.bride_family;
  const groomFamily = (lang === 'fa' && invitation.groom_family_fa) ? invitation.groom_family_fa : invitation.groom_family;
  const venueText = (lang === 'fa' && invitation.venue_fa) ? invitation.venue_fa : invitation.venue;
  const messageText = (lang === 'fa' && invitation.message_fa) ? invitation.message_fa : invitation.message;

  const joinedNames = `${brideName} ${lang === 'fa' ? 'و' : '&'} ${groomName}`;
  const formattedDate = lang === 'fa' ? formatFaDate(invitation.date) : formatDate(invitation.date);

  document.title = `${brideName} & ${groomName} — WedLink`;
  document.getElementById('couple-names-front').textContent = joinedNames;
  document.getElementById('couple-names-back').textContent = joinedNames;

  const familyEl = document.getElementById('couple-family-back');
  if (familyEl) {
    if (brideFamily?.trim() || groomFamily?.trim()) {
      let familyText = '';
      if (lang === 'fa') {
        if (brideFamily?.trim() && groomFamily?.trim()) {
          familyText = `خانواده‌های محترم ${brideFamily.trim()} و ${groomFamily.trim()}`;
        } else {
          familyText = `خانواده محترم ${(brideFamily || groomFamily).trim()}`;
        }
      } else {
        if (brideFamily?.trim() && groomFamily?.trim()) {
          familyText = `${brideFamily.trim()} & ${groomFamily.trim()} Families`;
        } else {
          familyText = `${(brideFamily || groomFamily).trim()} Family`;
        }
      }
      familyEl.textContent = familyText;
      familyEl.style.display = 'block';
    } else {
      familyEl.style.display = 'none';
    }
  }
  
  // Date format based on lang
  document.getElementById('detail-date-front').textContent = formattedDate;
  document.getElementById('detail-date').textContent = formattedDate;
  
  if (invitation.time) {
    document.getElementById('detail-time').textContent = lang === 'fa' ? toPersianDigits(invitation.time) : invitation.time;
    document.getElementById('time-container').style.display = 'flex';
  } else {
    document.getElementById('time-container').style.display = 'none';
  }

  document.getElementById('detail-venue').textContent = venueText;

  // Eyebrow translation
  const eyebrowEl = document.querySelector('.inv-eyebrow');
  if (eyebrowEl) {
    eyebrowEl.textContent = lang === 'fa' 
      ? 'با کمال مسرت شما را به جشن ازدواج خود دعوت می‌نماییم' 
      : 'You are cordially invited to the wedding of';
  }

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
  setupBackgroundMusic();
  setupCardHoverTilt();
  startCountdown(invitation.date);
}

function applyLayout() {
  if (!invitation) return;
  const themeToUse = invitation.theme || 'modern-minimal';
  
  const body = document.getElementById('invite-body');
  const dir = body.getAttribute('dir') || '';
  body.className = `invite-page theme-${themeToUse} layout-3d-card`;
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

  const performFlip = (e) => {
    if (e) e.stopPropagation();
    // Force transition back to 0.8s for smooth click flips
    card.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.classList.toggle('flipped');
  };

  if (flipBtn) {
    flipBtn.addEventListener('click', performFlip);
  }

  card.addEventListener('click', performFlip);
}


// ─── Background Music Logic ────────────────────────────────────
function setupBackgroundMusic() {
  const musicBtn = document.getElementById('music-btn');
  const audio = document.getElementById('bg-music');
  const btnText = document.getElementById('music-btn-text');

  if (!musicBtn || !audio) return;

  const lang = getLang();
  
  // Localize text
  if (lang === 'fa') {
    btnText.textContent = 'پخش موسیقی';
  } else {
    btnText.textContent = 'PLAY MUSIC';
  }

  // Show player button
  musicBtn.style.display = 'flex';

  const toggleMusic = () => {
    if (audio.paused) {
      audio.play().then(() => {
        musicBtn.classList.add('playing');
        btnText.textContent = lang === 'fa' ? 'قطع موسیقی' : 'PAUSE MUSIC';
      }).catch(err => console.log('Audio playback blocked:', err));
    } else {
      audio.pause();
      musicBtn.classList.remove('playing');
      btnText.textContent = lang === 'fa' ? 'پخش موسیقی' : 'PLAY MUSIC';
    }
  };

  musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMusic();
  });

  // Try autoplay on first interaction with document
  const startAutoplay = () => {
    if (audio.paused && !musicBtn.classList.contains('playing')) {
      audio.play().then(() => {
        musicBtn.classList.add('playing');
        btnText.textContent = lang === 'fa' ? 'قطع موسیقی' : 'PAUSE MUSIC';
      }).catch(() => {});
    }
    // Remove listeners once interaction occurs
    document.removeEventListener('click', startAutoplay);
    document.removeEventListener('touchstart', startAutoplay);
  };

  document.addEventListener('click', startAutoplay);
  document.addEventListener('touchstart', startAutoplay);
}

// ─── Desktop 3D Card Hover Tilt ───────────────────────────────
function setupCardHoverTilt() {
  // Only apply on devices with mouse/hover capabilities
  if (window.matchMedia('(hover: hover)').matches) {
    const wrapper = document.querySelector('.card-perspective');
    const card = document.getElementById('invitation-card');

    if (!wrapper || !card) return;

    wrapper.addEventListener('mouseenter', () => {
      // Snappy tracking transition on hover
      card.style.transition = 'transform 0.15s ease-out';
    });

    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element
      const y = e.clientY - rect.top;  // y position within the element

      // Calculate tilt degrees (-15 to 15 degrees)
      const rotateX = ((y / rect.height) - 0.5) * -24; // Vertical tilt
      const rotateY = ((x / rect.width) - 0.5) * 24;   // Horizontal tilt

      // If card is flipped, Y rotation needs to be added to the base 180 degrees
      if (card.classList.contains('flipped')) {
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${180 - rotateY}deg)`;
      } else {
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
    });

    wrapper.addEventListener('mouseleave', () => {
      // Reset card tilt with smooth transition
      card.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      if (card.classList.contains('flipped')) {
        card.style.transform = 'rotateY(180deg)';
      } else {
        card.style.transform = 'rotateY(0deg)';
      }
    });
  }
}
