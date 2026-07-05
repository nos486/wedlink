/**
 * Cloudflare Pages Function — /api/config
 *
 * Returns runtime configuration to the frontend JS.
 * Set API_BASE_URL in the Cloudflare Pages project's environment variables
 * (Pages → your project → Settings → Environment variables).
 */
export async function onRequest(context) {
  const apiBaseUrl = context.env.API_BASE_URL ?? '';

  return new Response(JSON.stringify({ apiBaseUrl }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
