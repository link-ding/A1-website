import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { list, put } from '@vercel/blob';
import defaultContentJson from '../data/default-content.json' with { type: 'json' };

const BLOB_PREFIX = 'academy-one/content-';
const localPath = path.join(process.cwd(), 'data', 'content.json');
const tutorFields = ['name', 'role', 'tag', 'qual', 'subjectShort', 'subject', 'hook', 'bio', 'result'];
const textLimits = {
  name: 100,
  role: 160,
  tag: 100,
  qual: 240,
  subjectShort: 240,
  subject: 500,
  hook: 800,
  bio: 3000,
  result: 2000
};

export const defaultContent = defaultContentJson;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function text(value, field, required = false) {
  const next = typeof value === 'string' ? value.trim() : '';
  if (required && !next) throw new Error(`${field} is required.`);
  if (next.length > textLimits[field]) throw new Error(`${field} is too long.`);
  return next;
}

function id(value, fallback, used) {
  const base = String(value || fallback || 'item')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64) || 'item';
  let next = base;
  let suffix = 2;
  while (used.has(next)) next = `${base}-${suffix++}`;
  used.add(next);
  return next;
}

function validPrice(value, allowNull = false) {
  if (allowNull && (value === null || value === '')) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0 || number > 10000) {
    throw new Error('Prices must be greater than 0 and at most 10,000.');
  }
  return Math.round(number * 100) / 100;
}

function languageDetails(input, language) {
  const details = {};
  for (const field of tutorFields) {
    details[field] = text(input?.[field], field, field === 'name');
  }
  if (!details.name) throw new Error(`${language} tutor name is required.`);
  return details;
}

function validateTutors(input) {
  const removedTutors = Array.isArray(input.removedTutors) ? input.removedTutors : [];
  const source = Array.isArray(input.tutors)
    ? input.tutors
    : defaultContent.tutors.map((tutor) => ({
        ...clone(tutor),
        hidden: removedTutors.some(name => tutor.en.name === name || tutor.en.name.startsWith(`${name} `))
      }));
  if (source.length > 100) throw new Error('A maximum of 100 tutors is allowed.');
  const used = new Set();
  return source.map((tutor, index) => {
    if (!tutor || typeof tutor !== 'object' || Array.isArray(tutor)) throw new Error('Tutor data is invalid.');
    return {
      id: id(tutor.id, tutor.en?.name || `tutor-${index + 1}`, used),
      group: ['english', 'maths', 'humanities'].includes(tutor.group) ? tutor.group : 'english',
      hidden: Boolean(tutor.hidden),
      en: languageDetails(tutor.en, 'English'),
      zh: languageDetails(tutor.zh, 'Chinese')
    };
  });
}

function validatePricing(input) {
  const result = {};
  for (const subject of ['english', 'maths', 'humanitiesScience']) {
    const rows = input.pricing?.[subject] ?? defaultContent.pricing[subject];
    if (!Array.isArray(rows)) throw new Error(`Missing ${subject} pricing.`);
    if (rows.length > 50) throw new Error(`A maximum of 50 ${subject} price rows is allowed.`);
    const used = new Set();
    result[subject] = rows.map((row, index) => {
      const legacyDefault = defaultContent.pricing[subject].find((candidate) => candidate.id === row?.key);
      if (!row || !Array.isArray(row.values) || ![2, 4].includes(row.values.length)) {
        throw new Error(`Invalid ${subject} pricing row ${index + 1}.`);
      }
      return {
        id: id(row.id || row.key, row.labelEn || legacyDefault?.labelEn || `row-${index + 1}`, used),
        labelEn: text(row.labelEn ?? legacyDefault?.labelEn, 'name', true),
        labelZh: text(row.labelZh ?? legacyDefault?.labelZh, 'name', true),
        values: row.values.slice(0, 2).map((value) => validPrice(value, true))
      };
    });
  }
  return result;
}

export function validateContent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid content payload.');
  return {
    version: 3,
    tutors: validateTutors(input),
    pricing: validatePricing(input),
    groupClasses: {
      english: validPrice(input.groupClasses?.english),
      mathematics: validPrice(input.groupClasses?.mathematics)
    },
    updatedAt: typeof input.updatedAt === 'string' && !Number.isNaN(Date.parse(input.updatedAt))
      ? input.updatedAt
      : null
  };
}

async function readLocalContent() {
  try {
    return validateContent(JSON.parse(await readFile(localPath, 'utf8')));
  } catch {
    return clone(defaultContent);
  }
}

export async function readContent() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return readLocalContent();
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: BLOB_PREFIX, limit: 1000, ...(cursor ? { cursor } : {}) });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
  if (!latest) return clone(defaultContent);
  const response = await fetch(`${latest.url}?v=${encodeURIComponent(latest.uploadedAt)}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not read saved website content.');
  return validateContent(await response.json());
}

export async function writeContent(input) {
  const content = validateContent(input);
  content.updatedAt = new Date().toISOString();
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    if (process.env.VERCEL) throw new Error('BLOB_READ_WRITE_TOKEN is not configured.');
    await mkdir(path.dirname(localPath), { recursive: true });
    await writeFile(localPath, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
    return content;
  }
  await put(`${BLOB_PREFIX}${Date.now()}.json`, JSON.stringify(content), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    cacheControlMaxAge: 60
  });
  return content;
}
