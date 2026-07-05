/* ============================================================
   WedLink — Admin Dashboard JavaScript
   Uses SVGs instead of emojis
   ============================================================ */

// ─── SVG Icons ────────────────────────────────────────────────
const Icons = {
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`,
  mail: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>`,
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  message: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  palette: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>`,
  layout: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="3" x2="21" y1="9" y2="9"></line><line x1="9" x2="9" y1="9" y2="21"></line></svg>`,
  history: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M20 6 9 17l-5-5"></path></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  edit: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`,
  sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`,
  save: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`,
  xCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"></path></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>`
};

// ─── State ────────────────────────────────────────────────────
let API_BASE = '';
let invitations = [];
let editingSlug = null;
let uploadedImageBase64 = null;

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuthRedirect()) return;

  API_BASE = await getApiBaseUrl();

  const usernameEl = document.getElementById('nav-username');
  if (usernameEl) usernameEl.textContent = getUsername() || 'Admin';

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logoutAndRedirect(API_BASE);
  });

  if (!API_BASE) return;
  setupModal();
  setupImageUpload();
  setupForm();

  await loadInvitations();
});

// ─── API helper ───────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const url = `${API_BASE}/api${path}`;
  const res = await fetch(url, {
    headers: { ...authHeaders(), ...(opts.headers ?? {}) },
    ...opts,
  });

  if (res.status === 401) {
    clearAuth();
    window.location.replace('/login.html');
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || \`HTTP \${res.status}\`);
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
    document.getElementById('invitations-grid').innerHTML = \`
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">\${Icons.warning}</div>
        <p>Could not reach the API.<br>Make sure <code>API_BASE_URL</code> is set in your Pages environment variables.</p>
      </div>\`;
  }
}

// ─── Render Invitations ───────────────────────────────────────
function renderInvitations() {
  const grid = document.getElementById('invitations-grid');
  if (!invitations.length) {
    grid.innerHTML = \`
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">\${Icons.mail}</div>
        <h3>No invitations yet</h3>
        <p>Click "New Invitation" to craft your first wedding link!</p>
      </div>\`;
    return;
  }
  grid.innerHTML = invitations.map(inv => renderCard(inv)).join('');
}

function renderCard(inv) {
  const inviteUrl = \`\${window.location.origin}/invite.html?slug=\${inv.slug}\`;
  const formattedDate = formatDate(inv.date);

  return \`
    <div class="invitation-card" id="card-\${inv.slug}">
      <div class="invitation-card-header">
        <div class="couple-names">\${escHtml(inv.bride)} &amp; \${escHtml(inv.groom)}</div>
        <div class="invitation-date">\${Icons.calendar} \${formattedDate}</div>
      </div>

      <div class="invitation-card-body">
        <div class="info-row"><span class="info-icon">\${Icons.mapPin}</span><span>\${escHtml(inv.venue)}</span></div>
        \${inv.time ? \`<div class="info-row"><span class="info-icon">\${Icons.clock}</span><span>\${escHtml(inv.time)}</span></div>\` : ''}
        \${inv.message ? \`<div class="info-row"><span class="info-icon">\${Icons.message}</span><span style="font-style:italic;">\${escHtml(inv.message)}</span></div>\` : ''}
        <div class="badge-row">
          <span class="badge">\${Icons.palette} \${formatTheme(inv.theme)}</span>
          <span class="badge">\${Icons.layout} \${formatLayout(inv.desktop_layout || inv.layout)}</span>
        </div>
        <div class="info-row" style="margin-top:auto; padding-top:12px;">
          <span class="info-icon">\${Icons.history}</span>
          <span style="font-size:12px;">Created \${timeAgo(inv.created_at)}</span>
        </div>
      </div>

      <div class="link-preview">
        <span id="url-\${inv.slug}" title="\${escHtml(inviteUrl)}">\${escHtml(inviteUrl)}</span>
      </div>

      <div class="invitation-card-footer">
        <button class="btn btn-ghost btn-sm" onclick="copyLink('\${escAttr(inv.slug)}','\${escAttr(inviteUrl)}')" id="copy-btn-\${inv.slug}">
          \${Icons.copy} Copy
        </button>
        <button class="btn btn-ghost btn-sm" onclick="openInvite('\${escAttr(inviteUrl)}')">
          \${Icons.eye} Preview
        </button>
        <button class="btn btn-ghost btn-sm" onclick="openModalForEdit('\${escAttr(inv.slug)}')">
          \${Icons.edit} Edit
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteInvitation('\${escAttr(inv.slug)}')">
          \${Icons.trash}
        </button>
      </div>
    </div>\`;
}

// ─── Delete ───────────────────────────────────────────────────
async function deleteInvitation(slug) {
  if (!confirm('Delete this invitation?')) return;
  try {
    await apiFetch(\`/invitations/\${slug}\`, { method: 'DELETE' });
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
    const btn = document.getElementById(\`copy-btn-\${slug}\`);
    btn.innerHTML = \`\${Icons.check} Copied!\`;
    btn.classList.add('copy-success');
    setTimeout(() => {
      btn.innerHTML = \`\${Icons.copy} Copy\`;
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
  if (limitEl) limitEl.textContent = \`\${invitations.length}/10\`;

  const warningEl = document.getElementById('limit-warning');
  const warningText = document.getElementById('limit-warning-text');
  if (warningEl && warningText) {
    if (invitations.length >= 10) {
      warningText.textContent = 'You have reached the 10 invitation limit.';
      warningEl.style.display = 'flex';
      document.getElementById('open-modal-btn')?.setAttribute('disabled', 'true');
    } else if (invitations.length >= 8) {
      warningText.textContent = \`You have \${10 - invitations.length} invitation slot(s) remaining.\`;
      warningEl.style.display = 'flex';
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
  
  const titleText = document.getElementById('modal-title-text');
  if (titleText) titleText.textContent = 'New Invitation';
  
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.innerHTML = \`\${Icons.sparkles} Create Invitation\`;
  
  document.getElementById('create-form').reset();
  
  // Set default modern themes/layouts
  document.getElementById('theme').value = 'midnight-velvet';
  document.getElementById('desktop_layout').value = 'split-elegance';
  
  document.getElementById('create-modal').classList.add('active');
}

function openModalForEdit(slug) {
  const inv = invitations.find(i => i.slug === slug);
  if (!inv) return;

  editingSlug = slug;
  uploadedImageBase64 = inv.image_url && inv.image_url.startsWith('data:image') ? inv.image_url : null;
  
  const titleText = document.getElementById('modal-title-text');
  if (titleText) titleText.textContent = 'Edit Invitation';
  
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.innerHTML = \`\${Icons.save} Save Changes\`;
  
  const form = document.getElementById('create-form');
  form.bride.value = inv.bride;
  form.groom.value = inv.groom;
  form.date.value = inv.date;
  form.time.value = inv.time || '';
  form.venue.value = inv.venue;
  form.slug.value = inv.slug;
  form.message.value = inv.message || '';
  form.image_url.value = uploadedImageBase64 ? '(Uploaded Photo)' : (inv.image_url || '');
  
  // Map old themes/layouts to new ones if needed, or fallback gracefully
  form.theme.value = inv.theme || 'midnight-velvet';
  if (!form.theme.value) form.theme.value = 'midnight-velvet'; // fallback if old value doesn't exist in options
  
  form.desktop_layout.value = inv.desktop_layout || inv.layout || 'split-elegance';
  if (!form.desktop_layout.value) form.desktop_layout.value = 'split-elegance';

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
    submitBtn.innerHTML = '<span class="spinner" style="margin-right:8px;vertical-align:middle;"></span> Saving…';

    try {
      const isEdit = !!editingSlug;
      const url = isEdit ? \`/invitations/\${editingSlug}\` : '/invitations';
      
      const { data: savedData } = await apiFetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      });

      if (isEdit) {
        invitations = invitations.map(i => i.slug === editingSlug ? savedData : i);
        showToast('Invitation updated successfully!', 'success');
      } else {
        invitations.unshift(savedData);
        showToast('Invitation created successfully!', 'success');
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
      submitBtn.innerHTML = editingSlug ? \`\${Icons.save} Save Changes\` : \`\${Icons.sparkles} Create Invitation\`;
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
  const el = document.getElementById(\`error-\${field}\`);
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
  grid.innerHTML = Array(3).fill(\`
    <div class="skeleton-card">
      <div class="skeleton-header"></div>
      <div class="skeleton-body">
        <div class="skeleton-line" style="width:70%"></div>
        <div class="skeleton-line" style="width:50%"></div>
        <div class="skeleton-line" style="width:85%"></div>
      </div>
    </div>\`).join('');
}

// ─── Toast ────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const toastIcons = { success: Icons.checkCircle, error: Icons.xCircle, info: Icons.info };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = \`toast \${type}\`;
  toast.innerHTML = \`<span class="toast-icon">\${toastIcons[type]}</span><span>\${msg}</span>\`;
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
  if (days  > 0) return \`\${days}d ago\`;
  if (hours > 0) return \`\${hours}h ago\`;
  if (mins  > 0) return \`\${mins}m ago\`;
  return 'just now';
}

function formatTheme(theme) {
  const map = {
    'ethereal-pearl': 'Ethereal Pearl',
    'midnight-velvet': 'Midnight Velvet',
    'botanic-romance': 'Botanic Romance',
    // fallbacks
    'modern-minimal': 'Ethereal Pearl',
    'dark-luxury': 'Midnight Velvet',
    'light-floral': 'Botanic Romance',
    'royal-elegance': 'Midnight Velvet',
    'starlight-glamour': 'Midnight Velvet',
    'enchanted-forest': 'Botanic Romance'
  };
  return map[theme] || 'Midnight Velvet';
}

function formatLayout(layout) {
  const map = {
    'split-elegance': 'Split Elegance',
    'floating-card': 'Floating Card',
    'hero-cinematic': 'Hero Cinematic',
    // fallbacks
    'split-left': 'Split Elegance',
    'split-right': 'Split Elegance',
    'polaroid-center': 'Floating Card',
    'classic-card': 'Floating Card',
    'hero-top': 'Hero Cinematic',
    'full-overlay': 'Floating Card',
    'image-top': 'Hero Cinematic'
  };
  return map[layout] || 'Split Elegance';
}

// Expose for inline onclick handlers
window.copyLink          = copyLink;
window.openInvite        = openInvite;
window.openModalForEdit  = openModalForEdit;
window.deleteInvitation  = deleteInvitation;
window.closeModal        = closeModal;
