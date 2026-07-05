import { Hono } from 'hono';
import type { Env } from '../types';

const publicRoutes = new Hono<{ Bindings: Env }>();

// ─── GET /api/public/:slug — view invitation (no auth) ────────
publicRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const invitation = await c.env.DB
    .prepare(`
      SELECT id, slug, bride, groom, date, time, venue, message, image_url, theme, layout, created_at
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

// ─── POST /api/public/:slug/rsvp — submit RSVP (no auth) ─────
publicRoutes.post('/:slug/rsvp', async (c) => {
  const slug = c.req.param('slug');

  const invitation = await c.env.DB
    .prepare('SELECT id FROM invitations WHERE slug = ?')
    .bind(slug)
    .first<{ id: number }>();

  if (!invitation) {
    return c.json({ success: false, error: 'Invitation not found' }, 404);
  }

  let body: { guest_name?: string; attending?: boolean; message?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid request body' }, 400);
  }

  const { guest_name, attending, message } = body;

  if (!guest_name?.trim() || attending === undefined || attending === null) {
    return c.json({ success: false, error: 'guest_name and attending are required' }, 400);
  }

  await c.env.DB
    .prepare('INSERT INTO rsvps (invitation_id, guest_name, attending, message) VALUES (?, ?, ?, ?)')
    .bind(invitation.id, guest_name.trim(), attending ? 1 : 0, message?.trim() ?? null)
    .run();

  return c.json({
    success: true,
    message: attending
      ? `Thank you, ${guest_name.trim()}! We look forward to celebrating with you! 🎉`
      : `Thank you for letting us know, ${guest_name.trim()}. We'll miss you!`,
  });
});

export default publicRoutes;
