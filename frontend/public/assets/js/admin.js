/* ============================================================
   WedLink — Admin Dashboard JavaScript (v2, with auth)
   Requires: auth.js loaded first
   ============================================================ */

// ─── State ────────────────────────────────────────────────────
let API_BASE = '';
let invitations = [];

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

  // Modal & form wiring
  setupModal();
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
        ${inv.message ? `<div class="info-row"><span class="info-icon">💬</span><span style="font-style:italic;color:var(--text-muted)">${escHtml(inv.message)}</span></div>` : ''}
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
        <button class="btn btn-ghost btn-sm" onclick="toggleRsvps('${escAttr(inv.slug)}')" id="rsvp-btn-${inv.slug}">
          <span>📝</span> RSVPs
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteInvitation('${escAttr(inv.slug)}')">
          <span>🗑</span>
        </button>
      </div>

      <div id="rsvp-panel-${inv.slug}" style="display:none;padding:0 20px 16px">
        <div class="rsvp-panel">
          <div class="rsvp-panel-title">Guest Responses</div>
          <div id="rsvp-list-${inv.slug}" class="rsvp-list">
            <div style="color:var(--text-muted);font-size:13px">Loading…</div>
          </div>
        </div>
      </div>
    </div>`;
}

// ─── RSVP Panel ───────────────────────────────────────────────
async function toggleRsvps(slug) {
  const panel = document.getElementById(`rsvp-panel-${slug}`);
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    await loadRsvps(slug);
  } else {
    panel.style.display = 'none';
  }
}

async function loadRsvps(slug) {
  const list = document.getElementById(`rsvp-list-${slug}`);
  try {
    const { data } = await apiFetch(`/invitations/${slug}/rsvps`);
    if (!data.length) {
      list.innerHTML = '<div style="color:var(--text-muted);font-size:13px;font-style:italic">No RSVPs yet.</div>';
      return;
    }
    list.innerHTML = data.map(r => `
      <div class="rsvp-item">
        <span class="rsvp-guest">👤 ${escHtml(r.guest_name)}</span>
        <span class="badge ${r.attending ? 'badge-green' : 'badge-red'}">
          ${r.attending ? '✓ Attending' : '✗ Declining'}
        </span>
        ${r.message ? `<span class="rsvp-msg">"${escHtml(r.message)}"</span>` : ''}
      </div>`).join('');
  } catch {
    list.innerHTML = '<div style="color:#f87171;font-size:13px">Failed to load RSVPs.</div>';
  }
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
  document.getElementById('open-modal-btn')?.addEventListener('click', () => {
    if (invitations.length >= 10) {
      showToast('You have reached the maximum of 10 invitations.', 'error');
      return;
    }
    document.getElementById('create-modal').classList.add('active');
  });
  document.getElementById('open-modal-btn-hero')?.addEventListener('click', () => {
    if (invitations.length >= 10) {
      showToast('You have reached the maximum of 10 invitations.', 'error');
      return;
    }
    document.getElementById('create-modal').classList.add('active');
  });
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('create-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

function closeModal() {
  document.getElementById('create-modal').classList.remove('active');
  document.getElementById('create-form').reset();
  clearFormErrors();
}

// ─── Create Form ──────────────────────────────────────────────
function setupForm() {
  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors();

    const form = e.target;
    const body = {
      bride:   form.bride.value.trim(),
      groom:   form.groom.value.trim(),
      date:    form.date.value,
      venue:   form.venue.value.trim(),
      message: form.message.value.trim() || undefined,
    };

    const errors = validateForm(body);
    if (errors.length) { errors.forEach(({ field, msg }) => setFieldError(field, msg)); return; }

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Creating…';

    try {
      const { data: created } = await apiFetch('/invitations', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      invitations.unshift(created);
      renderInvitations();
      updateStats();
      closeModal();
      showToast('🎉 Invitation created successfully!', 'success');
    } catch (err) {
      showToast('Failed to create: ' + err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '✨ Create Invitation';
    }
  });
}

function validateForm({ bride, groom, date, venue }) {
  const errors = [];
  if (!bride) errors.push({ field: 'bride', msg: "Bride's name is required" });
  if (!groom) errors.push({ field: 'groom', msg: "Groom's name is required" });
  if (!date)  errors.push({ field: 'date',  msg: 'Wedding date is required' });
  if (!venue) errors.push({ field: 'venue', msg: 'Venue is required' });
  return errors;
}

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

// Expose for inline onclick handlers
window.copyLink          = copyLink;
window.openInvite        = openInvite;
window.toggleRsvps       = toggleRsvps;
window.deleteInvitation  = deleteInvitation;
window.closeModal        = closeModal;
