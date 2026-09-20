import { getSession, json } from '../server/auth.js';
import { readContent, writeContent } from '../server/content.js';

export default {
  async fetch(request) {
    if (request.method === 'GET') {
      try {
        return json(await readContent());
      } catch (error) {
        return json({ error: error.message || 'Could not load website content.' }, 500);
      }
    }

    if (request.method === 'PUT') {
      if (!getSession(request)) return json({ error: 'Please sign in again.' }, 401);
      try {
        return json(await writeContent(await request.json()));
      } catch (error) {
        const status = /BLOB_READ_WRITE_TOKEN/.test(error.message || '') ? 503 : 400;
        return json({ error: error.message || 'Could not save website content.' }, status);
      }
    }

    return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET, PUT' });
  }
};
