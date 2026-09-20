import { createSession, credentialsAreValid, json, sessionCookie } from '../server/auth.js';

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, { Allow: 'POST' });
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Please enter your email and password.' }, 400);
    }
    if (!credentialsAreValid(body.email, body.password)) {
      return json({ error: 'Email or password is incorrect.' }, 401);
    }
    const email = String(body.email).trim().toLowerCase();
    return json({ authenticated: true, email }, 200, {
      'Set-Cookie': sessionCookie(createSession(email), request)
    });
  }
};
