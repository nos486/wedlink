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
  setupRsvpModal();
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

// ─── RSVP Modal Logic ─────────────────────────────────────────
let rsvpAttending = true;

function setupRsvpModal() {
  const modal = document.getElementById('rsvp-modal');
  const btn = document.getElementById('rsvp-btn');
  const closeBtn = document.getElementById('rsvp-modal-close');
  const form = document.getElementById('rsvp-form');
  const acceptBtn = document.getElementById('btn-accept');
  const declineBtn = document.getElementById('btn-decline');

  if (!modal) return;

  // Bilingual translation of the form
  const lang = getLang();
  if (lang === 'fa') {
    document.getElementById('rsvp-modal-title').textContent = 'آیا در جشن ما شرکت می‌کنید؟';
    document.getElementById('rsvp-modal-subtitle').textContent = 'لطفاً با پر کردن فرم زیر ما را مطلع سازید';
    document.getElementById('label-guest-name').textContent = 'نام و نام خانوادگی شما';
    document.getElementById('guest_name').placeholder = 'نام خود را وارد کنید...';
    document.getElementById('label-attending').textContent = 'وضعیت حضور شما';
    document.getElementById('text-accept').textContent = 'با کمال میل شرکت می‌کنم';
    document.getElementById('text-decline').textContent = 'متأسفانه امکان حضور ندارم';
    document.getElementById('label-message').textContent = 'پیام تبریک برای عروس و داماد (اختیاری)';
    document.getElementById('rsvp_message').placeholder = 'پیام خود را بنویسید...';
    document.getElementById('text-submit').textContent = 'ارسال پاسخ';
  }

  // Open/Close
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      modal.classList.add('active');
      document.getElementById('rsvp-response').style.display = 'none';
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // Toggle buttons
  if (acceptBtn && declineBtn) {
    acceptBtn.addEventListener('click', () => {
      rsvpAttending = true;
      acceptBtn.classList.add('active');
      declineBtn.classList.remove('active');
    });

    declineBtn.addEventListener('click', () => {
      rsvpAttending = false;
      declineBtn.classList.add('active');
      acceptBtn.classList.remove('active');
    });
  }

  // Form submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const guestNameInput = document.getElementById('guest_name');
      const errName = document.getElementById('err-guest_name');
      const messageInput = document.getElementById('rsvp_message');
      const submitBtn = document.getElementById('rsvp-submit');
      const responseEl = document.getElementById('rsvp-response');

      // Reset
      errName.textContent = '';
      errName.style.display = 'none';
      responseEl.style.display = 'none';

      // Validate
      const name = guestNameInput.value.trim();
      if (!name) {
        errName.textContent = lang === 'fa' ? 'لطفاً نام خود را وارد کنید' : 'Name is required';
        errName.style.display = 'block';
        return;
      }

      // Submit
      submitBtn.disabled = true;
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = lang === 'fa' 
        ? '<span class="spinner"></span> در حال ارسال...' 
        : '<span class="spinner"></span> Sending...';

      try {
        const apiBase = await getApiBaseUrl();
        const res = await fetch(`${apiBase}/api/public/${encodeURIComponent(getSlug())}/rsvp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guest_name: name,
            attending: rsvpAttending,
            message: messageInput.value.trim() || undefined
          })
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Submission failed');

        responseEl.className = 'rsvp-response-message success';
        responseEl.textContent = data.message;
        responseEl.style.display = 'block';

        // Reset Form
        form.reset();
        rsvpAttending = true;
        acceptBtn.classList.add('active');
        declineBtn.classList.remove('active');

        // Close modal after delay
        setTimeout(() => {
          modal.classList.remove('active');
        }, 3000);

      } catch (err) {
        responseEl.className = 'rsvp-response-message error';
        responseEl.textContent = lang === 'fa' 
          ? 'خطا در ارسال پاسخ. لطفاً دوباره تلاش کنید.' 
          : err.message;
        responseEl.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }
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
