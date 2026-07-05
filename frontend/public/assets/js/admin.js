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
        <div class="invitation-date">📅 ${formattedDate}</div>
      </div>

      <div class="invitation-card-body">
        <div class="info-row"><span class="info-icon">📍</span><span>${escHtml(inv.venue)}</span></div>
        ${inv.time ? `<div class="info-row"><span class="info-icon">⏰</span><span>${escHtml(inv.time)}</span></div>` : ''}
        ${inv.message ? `<div class="info-row"><span class="info-icon">💬</span><span style="font-style:italic;color:var(--text-muted)">${escHtml(inv.message)}</span></div>` : ''}
        <div class="info-row" style="margin-top: 8px;">
          <span class="badge" style="background:var(--bg-card);border:1px solid var(--border)">🎨 ${formatTheme(inv.theme)}</span>
          <span class="badge" style="background:var(--bg-card);border:1px solid var(--border)">📐 ${formatLayout(inv.layout)}</span>
        </div>
        <div class="info-row"><span class="info-icon">🗓</span><span style="font-size:12px;color:var(--text-muted)">Created ${timeAgo(inv.created_at)}</span></div>
      </div>

      <div class="link-preview">
        <span id="url-${inv.slug}" title="${escHtml(inviteUrl)}">${escHtml(inviteUrl)}</span>
      </div>

      <div class="invitation-card-footer">
        <button class="btn btn-ghost btn-sm" onclick="copyLink('${escAttr(inv.slug)}','${escAttr(inviteUrl)}')" id="copy-btn-${inv.slug}">
          <span>📋</span> Copy Link
        </button>
        <button class="btn btn-ghost btn-sm" onclick="openInvite('${escAttr(inviteUrl)}')">
          <span>👁</span> Preview
        </button>
        <button class="btn btn-ghost btn-sm" onclick="openModalForEdit('${escAttr(inv.slug)}')">
          <span>✏️</span> Edit
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteInvitation('${escAttr(inv.slug)}')">
          <span>🗑</span>
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
  form.layout.value = inv.layout || 'image-top';

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
      layout:    form.layout.value,
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
  const icons = { success: '✅', error: '❌', info: '💡' };
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
    'royal-elegance': 'Royal Elegance ✨',
    'starlight-glamour': 'Starlight Glamour ✨',
    'enchanted-forest': 'Enchanted Forest ✨'
  };
  return map[theme] || 'Modern Minimal';
}

function formatLayout(layout) {
  const map = {
    'image-top': 'Hero Top',
    'split-screen': 'Split Screen',
    'image-background': 'Background'
  };
  return map[layout] || 'Hero Top';
}

// Expose for inline onclick handlers
window.copyLink          = copyLink;
window.openInvite        = openInvite;
window.openModalForEdit  = openModalForEdit;
window.deleteInvitation  = deleteInvitation;
window.closeModal        = closeModal;
