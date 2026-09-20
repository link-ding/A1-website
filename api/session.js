import { getSession, json } from '../server/auth.js';

export default {
  fetch(request) {
    const session = getSession(request);
    return session
      ? json({ authenticated: true, email: session.email })
      : json({ authenticated: false }, 401);
  }
};
