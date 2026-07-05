import { Hono } from 'hono';
import type { Env, AppVariables } from '../types';
import { requireAuth } from '../middleware/auth';

const auth = new Hono<{ Bindings: Env; Variables: AppVariables }>();

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Ensure admin user exists in users table ──────────────────
async function ensureAdminUser(db: D1Database, adminUsername: string): Promise<number> {
  const existing = await db
    .prepare('SELECT id FROM users WHERE username = ?')
    .bind(adminUsername)
    .first<{ id: number }>();

  if (existing) return existing.id;

  const result = await db
    .prepare('INSERT INTO users (username) VALUES (?)')
    .bind(adminUsername)
    .run();

  return result.meta.last_row_id as number;
}

// ─── POST /api/auth/login ─────────────────────────────────────
auth.post('/login', async (c) => {
  let body: { username?: string; password?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid request body' }, 400);
  }

  const { username, password } = body;

  if (!username?.trim() || !password) {
    return c.json({ success: false, error: 'Username and password are required' }, 400);
  }

  const adminUsername = (c.env.ADMIN_USERNAME ?? 'admin').trim();
  const adminPassword = c.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD env var is not set');
    return c.json({ success: false, error: 'Server is misconfigured. Contact the administrator.' }, 500);
  }

  // Credentials check — constant-time string comparison via equal-length check
  const usernameMatch = username.trim() === adminUsername;
  const passwordMatch = password === adminPassword;

  if (!usernameMatch || !passwordMatch) {
    return c.json({ success: false, error: 'Invalid username or password' }, 401);
  }

  // Ensure admin row exists in users table
  const userId = await ensureAdminUser(c.env.DB, adminUsername);

  // Create new session
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  await c.env.DB
    .prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, userId, expiresAt)
    .run();

  return c.json({
    success: true,
    data: { token, username: adminUsername, expiresAt },
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────
auth.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    await c.env.DB
      .prepare('DELETE FROM sessions WHERE token = ?')
      .bind(token)
      .run();
  }
  return c.json({ success: true, message: 'Logged out successfully' });
});

// ─── GET /api/auth/me ─────────────────────────────────────────
auth.get('/me', requireAuth, (c) => {
  return c.json({
    success: true,
    data: {
      userId: c.get('userId'),
      username: c.get('username'),
    },
  });
});

export default auth;
