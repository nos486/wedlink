/* ============================================================
   WedLink — Shared Auth Utilities
   Loaded before admin.js on protected pages.
   ============================================================ */

const TOKEN_KEY    = 'wedlink_token';
const USERNAME_KEY = 'wedlink_username';

// ─── Token management ─────────────────────────────────────────
function getToken()    { return localStorage.getItem(TOKEN_KEY);    }
function getUsername() { return localStorage.getItem(USERNAME_KEY); }

function setAuth(token, username) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  sessionStorage.removeItem('wedlink_api_url');
}

function isAuthenticated() { return !!getToken(); }

function authHeaders() {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

// ─── Runtime API URL ─────────────────────────────────────────
// Fetches API_BASE_URL from the Cloudflare Pages Function /api/config.
let _resolvedApiUrl = null;

async function getApiBaseUrl() {
  if (_resolvedApiUrl) return _resolvedApiUrl;

  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('config fetch failed');
    const { apiBaseUrl } = await res.json();
    _resolvedApiUrl = apiBaseUrl || window.location.origin;
  } catch {
    // Fallback: assume API is on the same origin (useful for local dev)
    _resolvedApiUrl = window.location.origin;
  }

  return _resolvedApiUrl;
}

// ─── Navigation guards ────────────────────────────────────────
/** Call on protected pages — redirects to /login.html if not logged in. */
function requireAuthRedirect() {
  if (!isAuthenticated()) {
    window.location.replace('/login.html');
    return false;
  }
  return true;
}

/** Call on login page — redirects to / if already logged in. */
function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.replace('/');
    return true;
  }
  return false;
}

// ─── Logout helper ────────────────────────────────────────────
async function logoutAndRedirect(apiBase) {
  const base = apiBase || (await getApiBaseUrl());
  try {
    await fetch(`${base}/api/auth/logout`, {
      method: 'POST',
      headers: authHeaders(),
    });
  } catch { /* best-effort */ }
  clearAuth();
  window.location.replace('/login.html');
}
