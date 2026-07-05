import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './types';
import invitations from './routes/invitations';
import rsvp from './routes/rsvp';

const app = new Hono<{ Bindings: Env }>();

// ─── Middleware ───────────────────────────────────────────────
app.use('*', logger());

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }),
);

// ─── Health check ─────────────────────────────────────────────
app.get('/', (c) =>
  c.json({
    name: 'WedLink API',
    version: '1.0.0',
    status: 'running',
    docs: 'https://github.com/nos486/wedlink',
  }),
);

// ─── Routes ──────────────────────────────────────────────────
app.route('/api/invitations', invitations);
app.route('/api/invitations', rsvp);

// ─── 404 fallback ────────────────────────────────────────────
app.notFound((c) =>
  c.json({ success: false, error: 'Route not found' }, 404),
);

// ─── Error handler ───────────────────────────────────────────
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ success: false, error: 'Internal server error' }, 500);
});

export default app;
