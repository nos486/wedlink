import { Hono } from 'hono';
import type { Env, Invitation, CreateInvitationBody, AppVariables } from '../types';
import { requireAuth } from '../middleware/auth';

const invitations = new Hono<{ Bindings: Env; Variables: AppVariables }>();

const MAX_INVITATIONS_PER_USER = 10;

// All invitation routes require authentication
invitations.use('*', requireAuth);

// ─── GET /api/invitations — list user's own invitations ───────
invitations.get('/', async (c) => {
  const userId = c.get('userId');

  const { results } = await c.env.DB
    .prepare(`
      SELECT *,
             (SELECT COUNT(*) FROM rsvps WHERE rsvps.invitation_id = invitations.id) as rsvp_count,
             (SELECT COUNT(*) FROM rsvps WHERE rsvps.invitation_id = invitations.id AND rsvps.attending = 1) as attending_count
        FROM invitations
       WHERE user_id = ?
       ORDER BY created_at DESC
    `)
    .bind(userId)
    .all<Invitation>();

  return c.json({ success: true, data: results });
});

// ─── POST /api/invitations — create (max 10 per user) ─────────
invitations.post('/', async (c) => {
  const userId = c.get('userId');

  // Enforce per-user limit
  const countRow = await c.env.DB
    .prepare('SELECT COUNT(*) as count FROM invitations WHERE user_id = ?')
    .bind(userId)
    .first<{ count: number }>();

  const currentCount = countRow?.count ?? 0;
  if (currentCount >= MAX_INVITATIONS_PER_USER) {
    return c.json(
      {
        success: false,
        error: `You have reached the maximum of ${MAX_INVITATIONS_PER_USER} invitations. Please delete one to create a new one.`,
        limit: MAX_INVITATIONS_PER_USER,
        current: currentCount,
      },
      429,
    );
  }

  let body: CreateInvitationBody;
  try {
    body = await c.req.json<CreateInvitationBody>();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const { slug: customSlug, bride, groom, date, time, venue, message, image_url, theme, desktop_layout, mobile_layout } = body;

  if (!bride?.trim() || !groom?.trim() || !date?.trim() || !venue?.trim()) {
    return c.json({ success: false, error: 'bride, groom, date, and venue are required' }, 400);
  }

  let finalSlug = customSlug?.trim();
  if (finalSlug) {
    if (!/^[a-z0-9-]+$/.test(finalSlug)) {
      return c.json({ success: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' }, 400);
    }
    const existing = await c.env.DB.prepare('SELECT id FROM invitations WHERE slug = ?').bind(finalSlug).first();
    if (existing) {
      return c.json({ success: false, error: 'That custom slug is already taken' }, 409);
    }
  } else {
    finalSlug = generateSlug(bride.trim(), groom.trim());
  }

  const result = await c.env.DB
    .prepare(
      'INSERT INTO invitations (user_id, slug, bride, groom, date, time, venue, message, image_url, theme, desktop_layout, mobile_layout) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      userId, 
      finalSlug, 
      bride.trim(), 
      groom.trim(), 
      date.trim(), 
      time?.trim() ?? null,
      venue.trim(), 
      message?.trim() ?? null,
      image_url?.trim() ?? null,
      theme?.trim() ?? 'modern-minimal',
      desktop_layout?.trim() ?? 'split-left',
      mobile_layout?.trim() ?? 'hero-top'
    )
    .run();

  const created = await c.env.DB
    .prepare('SELECT * FROM invitations WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first<Invitation>();

  return c.json({ success: true, data: created }, 201);
});

// ─── GET /api/invitations/:slug/rsvps — user's invitation RSVPs
invitations.get('/:slug/rsvps', async (c) => {
  const slug = c.req.param('slug');
  const userId = c.get('userId');

  const invitation = await c.env.DB
    .prepare('SELECT id FROM invitations WHERE slug = ? AND user_id = ?')
    .bind(slug, userId)
    .first<{ id: number }>();

  if (!invitation) {
    return c.json({ success: false, error: 'Invitation not found' }, 404);
  }

  const { results } = await c.env.DB
    .prepare('SELECT * FROM rsvps WHERE invitation_id = ? ORDER BY created_at DESC')
    .bind(invitation.id)
    .all();

  return c.json({ success: true, data: results });
});

// ─── PUT /api/invitations/:slug ──────────────────────────────
invitations.put('/:slug', async (c) => {
  const oldSlug = c.req.param('slug');
  const userId = c.get('userId');

  const invitation = await c.env.DB
    .prepare('SELECT id FROM invitations WHERE slug = ? AND user_id = ?')
    .bind(oldSlug, userId)
    .first<{ id: number }>();

  if (!invitation) {
    return c.json({ success: false, error: 'Invitation not found' }, 404);
  }

  let body: CreateInvitationBody;
  try {
    body = await c.req.json<CreateInvitationBody>();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const { slug: customSlug, bride, groom, date, time, venue, message, image_url, theme, desktop_layout, mobile_layout } = body;

  if (!bride?.trim() || !groom?.trim() || !date?.trim() || !venue?.trim()) {
    return c.json({ success: false, error: 'bride, groom, date, and venue are required' }, 400);
  }

  let finalSlug = oldSlug;
  if (customSlug?.trim() && customSlug.trim() !== oldSlug) {
    finalSlug = customSlug.trim();
    if (!/^[a-z0-9-]+$/.test(finalSlug)) {
      return c.json({ success: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' }, 400);
    }
    const existing = await c.env.DB.prepare('SELECT id FROM invitations WHERE slug = ?').bind(finalSlug).first();
    if (existing) {
      return c.json({ success: false, error: 'That custom slug is already taken' }, 409);
    }
  }

  await c.env.DB
    .prepare(
      'UPDATE invitations SET slug = ?, bride = ?, groom = ?, date = ?, time = ?, venue = ?, message = ?, image_url = ?, theme = ?, desktop_layout = ?, mobile_layout = ? WHERE id = ?'
    )
    .bind(
      finalSlug,
      bride.trim(),
      groom.trim(),
      date.trim(),
      time?.trim() ?? null,
      venue.trim(),
      message?.trim() ?? null,
      image_url?.trim() ?? null,
      theme?.trim() ?? 'modern-minimal',
      desktop_layout?.trim() ?? 'split-left',
      mobile_layout?.trim() ?? 'hero-top',
      invitation.id
    )
    .run();

  const updated = await c.env.DB
    .prepare('SELECT * FROM invitations WHERE id = ?')
    .bind(invitation.id)
    .first<Invitation>();

  return c.json({ success: true, data: updated });
});

// ─── DELETE /api/invitations/:slug ────────────────────────────
invitations.delete('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const userId = c.get('userId');

  const invitation = await c.env.DB
    .prepare('SELECT id FROM invitations WHERE slug = ? AND user_id = ?')
    .bind(slug, userId)
    .first<{ id: number }>();

  if (!invitation) {
    return c.json({ success: false, error: 'Invitation not found' }, 404);
  }

  await c.env.DB
    .prepare('DELETE FROM invitations WHERE id = ?')
    .bind(invitation.id)
    .run();

  return c.json({ success: true, message: 'Invitation deleted' });
});

// ─── Helpers ─────────────────────────────────────────────────
function generateSlug(bride: string, groom: string): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const random = Math.random().toString(36).substring(2, 8);
  return `${clean(bride)}-and-${clean(groom)}-${random}`;
}

export default invitations;
