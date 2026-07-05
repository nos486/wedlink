import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env, AppVariables } from './types';
import authRoutes from './routes/auth';
import invitationRoutes from './routes/invitations';
import publicRoutes from './routes/public';

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

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
    version: '2.0.0',
    status: 'running',
    docs: 'https://github.com/nos486/wedlink',
  }),
);

// ─── Routes ──────────────────────────────────────────────────
// Auth: login / logout / me
app.route('/api/auth', authRoutes);

// Protected: invitation CRUD (requires Bearer token)
app.route('/api/invitations', invitationRoutes);

// Public: view invitation + submit RSVP (no auth)
app.route('/api/public', publicRoutes);

// ─── Fallbacks ────────────────────────────────────────────────
app.notFound((c) =>
  c.json({ success: false, error: 'Route not found' }, 404),
);

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ success: false, error: 'Internal server error' }, 500);
});

export default app;
