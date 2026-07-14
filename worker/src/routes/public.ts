import { Hono } from 'hono';
import type { Env } from '../types';

const publicRoutes = new Hono<{ Bindings: Env }>();

// ─── GET /api/public/:slug — view invitation (no auth) ────────
publicRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const invitation = await c.env.DB
    .prepare(`
      SELECT id, slug, bride, groom, bride_fa, groom_fa, date, time, venue, venue_fa, message, message_fa, image_url, theme, desktop_layout, mobile_layout, created_at
        FROM invitations
       WHERE slug = ?
    `)
    .bind(slug)
    .first();

  if (!invitation) {
    return c.json({ success: false, error: 'Invitation not found' }, 404);
  }

  return c.json({ success: true, data: invitation });
});

export default publicRoutes;
