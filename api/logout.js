import { expiredSessionCookie, json } from '../server/auth.js';

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, { Allow: 'POST' });
    return json({ authenticated: false }, 200, { 'Set-Cookie': expiredSessionCookie(request) });
  }
};
