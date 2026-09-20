import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'ao_admin';
const SESSION_SECONDS = 60 * 60 * 8;

function productionCredentialsAreConfigured() {
  return process.env.VERCEL !== '1' ||
    Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

function allowedEmails() {
  const configured = process.env.ADMIN_EMAILS;
  return (configured || 'operations@academyone.com.au,admin@academyone.com.au')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function secret() {
  if (!productionCredentialsAreConfigured()) return null;
  return process.env.ADMIN_SESSION_SECRET || `academy-one-${process.env.ADMIN_PASSWORD || 'admin'}-session-v1`;
}

function sign(value) {
  const signingSecret = secret();
  if (!signingSecret) return null;
  return createHmac('sha256', signingSecret).update(value).digest('base64url');
}

function readCookies(request) {
  return Object.fromEntries(
    (request.headers.get('cookie') || '')
      .split(';')
      .map((part) => part.trim().split('='))
      .filter(([key]) => key)
      .map(([key, ...value]) => [key, decodeURIComponent(value.join('='))])
  );
}

export function credentialsAreValid(email, password) {
  return productionCredentialsAreConfigured() &&
    allowedEmails().includes(String(email || '').trim().toLowerCase()) &&
    String(password || '') === (process.env.ADMIN_PASSWORD || 'admin');
}

export function createSession(email) {
  const payload = Buffer.from(JSON.stringify({
    email: String(email).trim().toLowerCase(),
    expires: Date.now() + SESSION_SECONDS * 1000
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function getSession(request) {
  const token = readCookies(request)[COOKIE_NAME];
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (!expected) return null;
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!allowedEmails().includes(parsed.email) || parsed.expires <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function sessionCookie(token, request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure}`;
}

export function expiredSessionCookie(request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function json(data, status = 200, headers = {}) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...headers
    }
  });
}
