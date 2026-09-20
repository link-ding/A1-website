import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import login from './api/login.js';
import logout from './api/logout.js';
import session from './api/session.js';
import content from './api/content.js';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const handlers = {
  '/api/login': login,
  '/api/logout': logout,
  '/api/session': session,
  '/api/content': content
};
const websiteRoutes = new Set([
  '/', '/courses', '/pricing', '/tutors', '/contact', '/results', '/why',
  '/careers', '/timetable', '/credit'
]);
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function safeFilePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.replace(/^\/+/, '');
  const resolved = path.resolve(root, relative);
  return resolved.startsWith(`${root}${path.sep}`) ? resolved : null;
}

http.createServer(async (incoming, outgoing) => {
  const url = new URL(incoming.url, `http://127.0.0.1:${port}`);
  const handler = handlers[url.pathname];
  if (handler) {
    const chunks = [];
    for await (const chunk of incoming) chunks.push(chunk);
    const request = new Request(url, {
      method: incoming.method,
      headers: incoming.headers,
      body: chunks.length ? Buffer.concat(chunks) : undefined
    });
    const response = await handler.fetch(request);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
    return;
  }

  let filePath;
  if (url.pathname === '/admin') filePath = path.join(root, 'admin.html');
  else if (websiteRoutes.has(url.pathname)) filePath = path.join(root, 'Academy One.dc.html');
  else filePath = safeFilePath(url.pathname);

  try {
    if (!filePath) throw new Error('Invalid path');
    const body = await readFile(filePath);
    outgoing.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    outgoing.end(body);
  } catch {
    outgoing.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    outgoing.end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Academy One is running at http://127.0.0.1:${port}`);
});
