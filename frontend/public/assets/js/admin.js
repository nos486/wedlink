/* ============================================================
   WedLink — Admin Dashboard JavaScript (v2, with auth)
   Requires: auth.js loaded first
   ============================================================ */

// ─── State ────────────────────────────────────────────────────
let API_BASE = '';
let invitations = [];
let editingSlug = null;
let uploadedImageBase64 = null;

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Redirect to login if not authenticated
  if (!requireAuthRedirect()) return;

  // Resolve runtime API URL from Cloudflare Pages Function
  API_BASE = await getApiBaseUrl();

  // Display username in navbar
  const usernameEl = document.getElementById('nav-username');
  if (usernameEl) usernameEl.textContent = getUsername() || 'Admin';

  // Logout button
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logoutAndRedirect(API_BASE);
  });

  if (!API_BASE) return;
  setupModal();
  setupImageUpload();
  setupForm();

  // Load invitations
  await loadInvitations();
});

// ─── API helper ───────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const url = `${API_BASE}/api${path}`;
  const res = await fetch(url, {
    headers: { ...authHeaders(), ...(opts.headers ?? {}) },
    ...opts,
  });

  // Session expired or invalid — force re-login
  if (res.status === 401) {
    clearAuth();
    window.location.replace('/login.html');
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ─── Load Invitations ─────────────────────────────────────────
async function loadInvitations() {
  showSkeletons();
  try {
    const { data } = await apiFetch('/invitations');
    invitations = data ?? [];
    renderInvitations();
    updateStats();
  } catch (err) {
    if (err.message === 'Session expired') return;
    showToast('Failed to load invitations: ' + err.message, 'error');
    document.getElementById('invitations-grid').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">⚠️</div>
        <p>Could not reach the API.<br>Make sure <code>API_BASE_URL</code> is set in your Pages environment variables.</p>
      </div>`;
  }
}

// ─── Render Invitations ───────────────────────────────────────
function renderInvitations() {
  const grid = document.getElementById('invitations-grid');
  if (!invitations.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">💌</div>
        <h3 style="font-family:'Playfair Display',serif;font-size:22px;color:var(--text);margin-bottom:8px">No invitations yet</h3>
        <p>Click "New Invitation" to craft your first wedding link!</p>
      </div>`;
    return;
  }
  grid.innerHTML = invitations.map(inv => renderCard(inv)).join('');
}

function renderCard(inv) {
  const inviteUrl = `${window.location.origin}/invite.html?slug=${inv.slug}`;
  const formattedDate = formatDate(inv.date);

  return `
    <div class="invitation-card" id="card-${inv.slug}">
      <div class="invitation-card-header">
        <div class="couple-names">${escHtml(inv.bride)} &amp; ${escHtml(inv.groom)}</div>
        <div class="invitation-date">
          <svg class="svg-icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          ${formattedDate}
        </div>
      </div>

      <div class="invitation-card-body">
        <div class="info-row">
          <svg class="svg-icon" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>${escHtml(inv.venue)}</span>
        </div>
        ${inv.time ? `
          <div class="info-row">
            <svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>${escHtml(inv.time)}</span>
          </div>` : ''}
        ${inv.message ? `
          <div class="info-row">
            <svg class="svg-icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span style="font-style:italic;color:var(--text-muted)">${escHtml(inv.message)}</span>
          </div>` : ''}
        
        <div class="info-row" style="margin-top: 8px;">
          <span class="badge" style="background:var(--bg-card);border:1px solid var(--border)">
            <svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.02058 19.162 5.09214 19.3953 5.04838 19.6207C4.94559 20.15 5.25867 20.6724 5.79093 20.8252C7.75549 21.3892 9.84365 21.6792 12 22Z"></path><circle cx="7.5" cy="10.5" r="1.5" fill="currentColor"></circle><circle cx="11.5" cy="7.5" r="1.5" fill="currentColor"></circle><circle cx="16.5" cy="9.5" r="1.5" fill="currentColor"></circle></svg>
            ${formatTheme(inv.theme)}
          </span>
          <span class="badge" style="background:var(--bg-card);border:1px solid var(--border)">
            <svg class="svg-icon" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            ${formatLayout(inv.desktop_layout || inv.layout || 'split-left')}
          </span>
          <span class="badge" style="background:var(--bg-card);border:1px solid var(--border)">
            <svg class="svg-icon" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="18.01"></line></svg>
            ${formatLayout(inv.mobile_layout || inv.layout || 'hero-top')}
          </span>
        </div>
        <div class="info-row">
          <svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 15 15"></polyline></svg>
          <span style="font-size:12px;color:var(--text-muted)">Created ${timeAgo(inv.created_at)}</span>
        </div>
      </div>

      <div class="link-preview">
        <span id="url-${inv.slug}" title="${escHtml(inviteUrl)}">${escHtml(inviteUrl)}</span>
      </div>

      <div class="invitation-card-footer">
        <button class="btn btn-ghost btn-sm" onclick="copyLink('${escAttr(inv.slug)}','${escAttr(inviteUrl)}')" id="copy-btn-${inv.slug}">
          <svg class="svg-icon" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy Link
        </button>
        <button class="btn btn-ghost btn-sm" onclick="openInvite('${escAttr(inviteUrl)}')">
          <svg class="svg-icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          Preview
        </button>
        <button class="btn btn-ghost btn-sm" onclick="openModalForEdit('${escAttr(inv.slug)}')">
          <svg class="svg-icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Edit
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteInvitation('${escAttr(inv.slug)}')">
          <svg class="svg-icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>
    </div>`;
}

// ─── Delete ───────────────────────────────────────────────────
async function deleteInvitation(slug) {
  if (!confirm('Delete this invitation? All RSVPs will also be removed.')) return;
  try {
    await apiFetch(`/invitations/${slug}`, { method: 'DELETE' });
    invitations = invitations.filter(i => i.slug !== slug);
    renderInvitations();
    updateStats();
    showToast('Invitation deleted.', 'info');
  } catch (err) {
    showToast('Delete failed: ' + err.message, 'error');
  }
}

// ─── Copy & Preview ───────────────────────────────────────────
async function copyLink(slug, url) {
  try {
    await navigator.clipboard.writeText(url);
    const btn = document.getElementById(`copy-btn-${slug}`);
    btn.innerHTML = '<span>✅</span> Copied!';
    btn.classList.add('copy-success');
    setTimeout(() => {
      btn.innerHTML = '<span>📋</span> Copy Link';
      btn.classList.remove('copy-success');
    }, 2000);
    showToast('Link copied to clipboard!', 'success');
  } catch {
    showToast('Could not copy — please copy manually.', 'error');
  }
}

function openInvite(url) { window.open(url, '_blank', 'noopener'); }

// ─── Stats ────────────────────────────────────────────────────
function updateStats() {
  const countEl = document.getElementById('stat-invitations');
  const limitEl = document.getElementById('stat-limit');
  if (countEl) countEl.textContent = invitations.length;
  if (limitEl) limitEl.textContent = `${invitations.length}/10`;

  // Show limit warning when close to limit
  const warningEl = document.getElementById('limit-warning');
  if (warningEl) {
    if (invitations.length >= 10) {
      warningEl.textContent = '⚠️ You have reached the 10 invitation limit.';
      warningEl.style.display = 'block';
      document.getElementById('open-modal-btn')?.setAttribute('disabled', 'true');
    } else if (invitations.length >= 8) {
      warningEl.textContent = `⚠️ You have ${10 - invitations.length} invitation slot(s) remaining.`;
      warningEl.style.display = 'block';
    } else {
      warningEl.style.display = 'none';
    }
  }
}

// ─── Modal ────────────────────────────────────────────────────
function setupModal() {
  document.getElementById('open-modal-btn')?.addEventListener('click', () => openModalForCreate());
  document.getElementById('open-modal-btn-hero')?.addEventListener('click', () => openModalForCreate());
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('create-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

function openModalForCreate() {
  if (invitations.length >= 10) {
    showToast('You have reached the maximum of 10 invitations.', 'error');
    return;
  }
  editingSlug = null;
  uploadedImageBase64 = null;
  document.getElementById('modal-title').innerHTML = '<span style="color:var(--gold)">✨</span> New Invitation';
  document.getElementById('submit-btn').innerHTML = '✨ Create Invitation';
  document.getElementById('create-form').reset();
  document.getElementById('create-modal').classList.add('active');
}

function openModalForEdit(slug) {
  const inv = invitations.find(i => i.slug === slug);
  if (!inv) return;

  editingSlug = slug;
  uploadedImageBase64 = inv.image_url && inv.image_url.startsWith('data:image') ? inv.image_url : null;
  
  document.getElementById('modal-title').innerHTML = '<span style="color:var(--gold)">✏️</span> Edit Invitation';
  document.getElementById('submit-btn').innerHTML = '💾 Save Changes';
  
  const form = document.getElementById('create-form');
  form.bride.value = inv.bride;
  form.groom.value = inv.groom;
  form.date.value = inv.date;
  form.time.value = inv.time || '';
  form.venue.value = inv.venue;
  form.slug.value = inv.slug;
  form.message.value = inv.message || '';
  form.image_url.value = uploadedImageBase64 ? '(Uploaded Photo)' : (inv.image_url || '');
  form.theme.value = inv.theme || 'modern-minimal';
  form.desktop_layout.value = inv.desktop_layout || inv.layout || 'split-left';
  form.mobile_layout.value = inv.mobile_layout || inv.layout || 'hero-top';

  clearFormErrors();
  document.getElementById('create-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('create-modal').classList.remove('active');
  document.getElementById('create-form').reset();
  editingSlug = null;
  uploadedImageBase64 = null;
  clearFormErrors();
}

// ─── Create Form ──────────────────────────────────────────────
function setupForm() {
  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors();

    const form = e.target;
    const body = {
      bride:     form.bride.value.trim(),
      groom:     form.groom.value.trim(),
      date:      form.date.value,
      time:      form.time.value.trim() || undefined,
      venue:     form.venue.value.trim(),
      slug:      form.slug.value.trim() || undefined,
      message:   form.message.value.trim() || undefined,
      image_url: uploadedImageBase64 || form.image_url.value.trim() || undefined,
      theme:     form.theme.value,
      desktop_layout: form.desktop_layout.value,
      mobile_layout:  form.mobile_layout.value,
    };

    const errors = validateForm(body);
    if (errors.length) { errors.forEach(({ field, msg }) => setFieldError(field, msg)); return; }

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Saving…';

    try {
      const isEdit = !!editingSlug;
      const url = isEdit ? `/invitations/${editingSlug}` : '/invitations';
      
      const { data: savedData } = await apiFetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      });

      if (isEdit) {
        invitations = invitations.map(i => i.slug === editingSlug ? savedData : i);
        showToast('💾 Invitation updated successfully!', 'success');
      } else {
        invitations.unshift(savedData);
        showToast('🎉 Invitation created successfully!', 'success');
      }

      renderInvitations();
      updateStats();
      closeModal();
    } catch (err) {
      if (err.message.includes('slug')) {
        setFieldError('slug', err.message);
      } else {
        showToast('Failed to save: ' + err.message, 'error');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = editingSlug ? '💾 Save Changes' : '✨ Create Invitation';
    }
  });
}

function validateForm({ bride, groom, date, venue, slug }) {
  const errors = [];
  if (!bride) errors.push({ field: 'bride', msg: "Bride's name is required" });
  if (!groom) errors.push({ field: 'groom', msg: "Groom's name is required" });
  if (!date)  errors.push({ field: 'date',  msg: 'Wedding date is required' });
  if (!venue) errors.push({ field: 'venue', msg: 'Venue is required' });
  if (slug && !/^[a-z0-9-]+$/.test(slug)) errors.push({ field: 'slug', msg: 'Lowercase letters, numbers, hyphens only' });
  return errors;
}

// ─── Image Upload & Compress ──────────────────────────────────
function setupImageUpload() {
  const fileInput = document.getElementById('image_file');
  const urlInput = document.getElementById('image_url');
  const errorSpan = document.getElementById('error-image_file');

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    errorSpan.textContent = '';
    urlInput.value = 'Processing image...';
    urlInput.disabled = true;

    try {
      if (file.size > 15 * 1024 * 1024) throw new Error('File is too large (max 15MB before compression)');
      
      const compressedDataUrl = await compressImage(file);
      
      const base64Size = Math.round((compressedDataUrl.length * 3) / 4);
      if (base64Size > 5 * 1024 * 1024) throw new Error('Image too complex, please use a smaller image');

      uploadedImageBase64 = compressedDataUrl;
      urlInput.value = '(Uploaded Photo)';
      showToast('Image processed successfully!', 'success');
    } catch (err) {
      errorSpan.textContent = err.message;
      urlInput.value = '';
      uploadedImageBase64 = null;
    } finally {
      urlInput.disabled = false;
    }
  });

  urlInput.addEventListener('input', () => {
    if (urlInput.value !== '(Uploaded Photo)') {
      uploadedImageBase64 = null;
    }
  });
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_dim = 1920;

        if (width > height && width > max_dim) {
          height = Math.round(height * (max_dim / width));
          width = max_dim;
        } else if (height > max_dim) {
          width = Math.round(width * (max_dim / height));
          height = max_dim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => reject(new Error('Invalid image file'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

// ─── API & Auth Utils ─────────────────────────────────────────
function setFieldError(field, msg) {
  const el = document.getElementById(`error-${field}`);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function clearFormErrors() {
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = ''; el.style.display = 'none';
  });
}

// ─── RSVP Dashboard Panel Logic ────────────────────────────────
async function toggleRsvps(slug) {
  const drawer = document.getElementById(`rsvp-drawer-${slug}`);
  const arrow = document.getElementById(`rsvp-arrow-${slug}`);
  if (!drawer || !arrow) return;

  const isActive = drawer.classList.toggle('active');
  if (isActive) {
    arrow.style.transform = 'rotate(180deg)';
    await loadRsvpsForSlug(slug);
  } else {
    arrow.style.transform = 'rotate(0deg)';
  }
}

async function loadRsvpsForSlug(slug) {
  const container = document.getElementById(`rsvp-list-${slug}`);
  if (!container) return;

  container.innerHTML = '<div style="text-align:center;padding:12px;color:var(--text-muted);"><span class="spinner"></span> Loading...</div>';

  try {
    const { data } = await apiFetch(`/invitations/${slug}/rsvps`);
    if (!data || !data.length) {
      container.innerHTML = '<div class="rsvp-list-empty">No responses yet.</div>';
      return;
    }

    container.innerHTML = data.map(r => {
      const attendingText = r.attending ? 'Attending' : 'Declined';
      const badgeClass = r.attending ? 'badge-green' : 'badge-red';
      const statusIcon = r.attending 
        ? `<svg class="svg-icon" style="width:12px;height:12px;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>` 
        : `<svg class="svg-icon" style="width:12px;height:12px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

      return `
        <div class="rsvp-item">
          <div class="rsvp-item-header">
            <span class="rsvp-guest-name">${escHtml(r.guest_name)}</span>
            <span class="badge ${badgeClass}" style="padding:2px 8px; font-size:11px; display:inline-flex; align-items:center; gap:4px;">
              ${statusIcon} ${attendingText}
            </span>
          </div>
          ${r.message ? `<div class="rsvp-guest-message">${escHtml(r.message)}</div>` : ''}
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="rsvp-list-empty" style="color:#f87171;">Failed to load: ${escHtml(err.message)}</div>`;
  }
}

// ─── Skeleton Loader ──────────────────────────────────────────
function showSkeletons() {
  const grid = document.getElementById('invitations-grid');
  grid.innerHTML = Array(3).fill(`
    <div class="skeleton-card">
      <div class="skeleton-header"></div>
      <div class="skeleton-body">
        <div class="skeleton-line" style="width:70%"></div>
        <div class="skeleton-line" style="width:50%"></div>
        <div class="skeleton-line" style="width:85%"></div>
      </div>
    </div>`).join('');
}

// ─── Toast ────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const icons = {
    success: `<svg class="svg-icon" style="color:#4ade80;" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    error: `<svg class="svg-icon" style="color:#f87171;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    info: `<svg class="svg-icon" style="color:var(--gold);" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
  };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-hide');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3500);
}

// ─── Utilities ────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function escAttr(str) { return String(str ?? '').replace(/'/g, "\\'"); }

function formatDate(dateStr) {
  try { return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }); }
  catch { return dateStr; }
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff/60000), hours = Math.floor(mins/60), days = Math.floor(hours/24);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return 'just now';
}

function formatTheme(theme) {
  const map = {
    'modern-minimal': 'Modern Minimal',
    'dark-luxury': 'Dark Luxury',
    'light-floral': 'Light Floral',
    'royal-elegance': 'Royal Elegance',
    'starlight-glamour': 'Starlight Glamour',
    'enchanted-forest': 'Enchanted Forest'
  };
  return map[theme] || 'Modern Minimal';
}

function formatLayout(layout) {
  const map = {
    'split-left': 'Split (L)',
    'split-right': 'Split (R)',
    'polaroid-center': 'Polaroid',
    'classic-card': 'Classic Card',
    'hero-top': 'Hero Top',
    'full-overlay': 'Overlay',
    'image-top': 'Hero Top',
    'split-screen': 'Split (L)',
    'image-background': 'Overlay'
  };
  return map[layout] || 'Hero Top';
}

// Expose for inline onclick handlers
window.copyLink          = copyLink;
window.openInvite        = openInvite;
window.openModalForEdit  = openModalForEdit;
window.deleteInvitation  = deleteInvitation;
window.closeModal        = closeModal;
window.toggleRsvps       = toggleRsvps;
