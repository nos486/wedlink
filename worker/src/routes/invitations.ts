import { Hono } from 'hono';
import type { Env, Invitation, CreateInvitationBody } from '../types';

const invitations = new Hono<{ Bindings: Env }>();

// ─── List all invitations ────────────────────────────────────
invitations.get('/', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT * FROM invitations ORDER BY created_at DESC')
    .all<Invitation>();
  return c.json({ success: true, data: results });
});

// ─── Get single invitation by slug ──────────────────────────
invitations.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const invitation = await c.env.DB
    .prepare('SELECT * FROM invitations WHERE slug = ?')
    .bind(slug)
    .first<Invitation>();

  if (!invitation) {
    return c.json({ success: false, error: 'Invitation not found' }, 404);
  }
  return c.json({ success: true, data: invitation });
});

// ─── Create invitation ───────────────────────────────────────
invitations.post('/', async (c) => {
  let body: CreateInvitationBody;
  try {
    body = await c.req.json<CreateInvitationBody>();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const { bride, groom, date, venue, message } = body;

  if (!bride?.trim() || !groom?.trim() || !date?.trim() || !venue?.trim()) {
    return c.json({ success: false, error: 'bride, groom, date, and venue are required' }, 400);
  }

  const slug = generateSlug(bride.trim(), groom.trim());

  const result = await c.env.DB
    .prepare('INSERT INTO invitations (slug, bride, groom, date, venue, message) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(slug, bride.trim(), groom.trim(), date.trim(), venue.trim(), message?.trim() ?? null)
    .run();

  const created = await c.env.DB
    .prepare('SELECT * FROM invitations WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first<Invitation>();

  return c.json({ success: true, data: created }, 201);
});

// ─── Get RSVPs for an invitation ────────────────────────────
invitations.get('/:slug/rsvps', async (c) => {
  const slug = c.req.param('slug');
  const invitation = await c.env.DB
    .prepare('SELECT id FROM invitations WHERE slug = ?')
    .bind(slug)
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

// ─── Delete invitation ───────────────────────────────────────
invitations.delete('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const invitation = await c.env.DB
    .prepare('SELECT id FROM invitations WHERE slug = ?')
    .bind(slug)
    .first<{ id: number }>();

  if (!invitation) {
    return c.json({ success: false, error: 'Invitation not found' }, 404);
  }

  await c.env.DB.prepare('DELETE FROM invitations WHERE id = ?').bind(invitation.id).run();
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
