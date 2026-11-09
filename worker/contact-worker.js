// Cloudflare Worker: verifies the Turnstile token, then forwards the message.
// Settings > Variables: TURNSTILE_SECRET (secret), CONTACT_EMAIL, ALLOWED_ORIGIN (e.g. https://YOUR-DOMAIN.com)
export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    const reply = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return reply({ success: false, message: 'Method not allowed' }, 405);

    let data;
    try { data = await request.json(); } catch { return reply({ success: false, message: 'Bad request' }, 400); }
    const { name, email, message, token } = data;
    if (!name || !email || !message || !token) return reply({ success: false, message: 'Missing fields' }, 400);

    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') || ''
      })
    }).then((r) => r.json());
    if (!check.success) return reply({ success: false, message: 'Spam check failed' }, 403);

    const sent = await fetch(`https://formsubmit.co/ajax/${env.CONTACT_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: env.ALLOWED_ORIGIN, Referer: env.ALLOWED_ORIGIN + '/' },
      body: JSON.stringify({ name, email, message, _subject: `Portfolio message from ${name}`, _template: 'table', _captcha: 'false' })
    });
    return reply({ success: sent.ok }, sent.ok ? 200 : 502);
  }
};
