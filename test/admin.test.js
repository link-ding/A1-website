import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, credentialsAreValid, getSession, sessionCookie } from '../server/auth.js';
import { defaultContent, validateContent } from '../server/content.js';
import contentHandler from '../api/content.js';

test('accepts both Academy One admin emails with the requested password', () => {
  assert.equal(credentialsAreValid('operations@academyone.com.au', 'admin'), true);
  assert.equal(credentialsAreValid('ADMIN@academyone.com.au', 'admin'), true);
  assert.equal(credentialsAreValid('someone@example.com', 'admin'), false);
  assert.equal(credentialsAreValid('operations@academyone.com.au', 'wrong'), false);
});

test('rejects production login when secure credentials are not configured', () => {
  const previous = {
    vercel: process.env.VERCEL,
    password: process.env.ADMIN_PASSWORD,
    secret: process.env.ADMIN_SESSION_SECRET
  };
  process.env.VERCEL = '1';
  delete process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_SESSION_SECRET;
  try {
    assert.equal(credentialsAreValid('operations@academyone.com.au', 'admin'), false);
  } finally {
    if (previous.vercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous.vercel;
    if (previous.password === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = previous.password;
    if (previous.secret === undefined) delete process.env.ADMIN_SESSION_SECRET;
    else process.env.ADMIN_SESSION_SECRET = previous.secret;
  }
});

test('creates and verifies a signed session cookie', () => {
  const loginRequest = new Request('https://academyone.example/api/login');
  const cookie = sessionCookie(createSession('operations@academyone.com.au'), loginRequest).split(';')[0];
  const request = new Request('https://academyone.example/api/session', { headers: { cookie } });
  assert.equal(getSession(request)?.email, 'operations@academyone.com.au');
});

test('validates bilingual tutors and prices', () => {
  const valid = validateContent(defaultContent);
  assert.equal(valid.tutors.length, 17);
  assert.equal(valid.groupClasses.english, 65);
  assert.throws(() => validateContent({ ...defaultContent, groupClasses: { english: -1, mathematics: 85 } }), /greater than 0/);
  const missingChineseName = structuredClone(defaultContent);
  missingChineseName.tutors[0].zh.name = '';
  assert.throws(() => validateContent(missingChineseName), /name is required/);
});

test('allows new tutors and editable pricing rows', () => {
  const input = structuredClone(defaultContent);
  input.tutors.push({
    id: 'new-tutor',
    group: 'maths',
    hidden: false,
    en: { name: 'New Tutor' },
    zh: { name: '新导师' }
  });
  input.pricing.english.push({ id: 'new-rate', labelEn: 'New Tutor', labelZh: '新导师', values: [90, 100, null, 120] });
  const valid = validateContent(input);
  assert.equal(valid.tutors.at(-1).en.name, 'New Tutor');
  assert.equal(valid.tutors.at(-1).group, 'maths');
  assert.deepEqual(valid.pricing.english.at(-1).values, [90, 100, null, 120]);
});

test('migrates the previous visibility and fixed-price format', () => {
  const legacy = {
    removedTutors: ['Kevin'],
    pricing: Object.fromEntries(Object.entries(defaultContent.pricing).map(([subject, rows]) => [
      subject,
      rows.map((row) => ({ key: row.id, values: row.values }))
    ])),
    groupClasses: defaultContent.groupClasses,
    updatedAt: null
  };
  const migrated = validateContent(legacy);
  assert.equal(migrated.tutors.find((tutor) => tutor.en.name === 'Kevin').hidden, true);
  assert.equal(migrated.pricing.english[0].labelEn, 'Senior Tutor');
});

test('content endpoint blocks unauthenticated writes', async () => {
  const request = new Request('https://academyone.example/api/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(defaultContent)
  });
  const response = await contentHandler.fetch(request);
  assert.equal(response.status, 401);
});
