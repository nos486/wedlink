import { createMiddleware } from 'hono/factory';
import type { Env, AppVariables } from '../types';

/**
 * requireAuth middleware
 * Validates Bearer token from Authorization header against D1 sessions.
 * Sets `userId` and `username` context variables on success.
 */
export const requireAuth = createMiddleware<{
  Bindings: Env;
  Variables: AppVariables;
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Authentication required' }, 401);
  }

  const token = authHeader.slice(7).trim();

  const session = await c.env.DB
    .prepare(`
      SELECT s.user_id, u.username
        FROM sessions s
        JOIN users u ON s.user_id = u.id
       WHERE s.token = ?
         AND s.expires_at > datetime('now')
    `)
    .bind(token)
    .first<{ user_id: number; username: string }>();

  if (!session) {
    return c.json({ success: false, error: 'Invalid or expired session. Please log in again.' }, 401);
  }

  c.set('userId', session.user_id);
  c.set('username', session.username);

  await next();
});
