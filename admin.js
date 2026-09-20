const tutorFields = [
  ['name', 'Name / 姓名', 'input'],
  ['role', 'Role / 职位', 'input'],
  ['tag', 'Category tag / 分类标签', 'input'],
  ['qual', 'Qualifications / 学历资质', 'input'],
  ['subjectShort', 'Short subjects / 简短科目', 'input'],
  ['subject', 'Full subjects / 完整科目', 'textarea'],
  ['hook', 'Introduction / 简介标题', 'textarea'],
  ['bio', 'Biography / 个人介绍', 'textarea'],
  ['result', 'Student results / 学生成绩', 'textarea']
];

let content;
let dirty = false;
let focusTutorId = null;

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function makeId(prefix) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.error || 'Something went wrong.'), { status: response.status });
  return body;
}

function show(view) {
  $('#loading-view').hidden = view !== 'loading';
  $('#login-view').hidden = view !== 'login';
  $('#admin-view').hidden = view !== 'admin';
}

function setMessage(message, type = 'notice') {
  const element = $('#page-message');
  element.textContent = message;
  element.className = type;
  element.hidden = !message;
}

function markDirty() {
  dirty = true;
  $('#save-hint').textContent = 'You have unpublished changes.';
  setMessage('');
}

function tutorField(tutor, language, [field, label, type]) {
  const value = tutor[language]?.[field] || '';
  const control = type === 'textarea'
    ? `<textarea rows="${field === 'bio' ? 5 : 3}" data-tutor-id="${tutor.id}" data-lang="${language}" data-field="${field}">${escapeHtml(value)}</textarea>`
    : `<input type="text" data-tutor-id="${tutor.id}" data-lang="${language}" data-field="${field}" value="${escapeHtml(value)}"${field === 'name' ? ' required' : ''}>`;
  return `<label class="editor-field"><span>${label}</span>${control}</label>`;
}

function renderTutors() {
  const visible = content.tutors.filter((tutor) => !tutor.hidden).length;
  $('#tutor-count').textContent = `${visible} shown, ${content.tutors.length - visible} hidden`;
  $('#tutor-list').innerHTML = content.tutors.map((tutor) => `
    <details class="tutor-editor${tutor.hidden ? ' is-hidden' : ''}" data-editor-id="${tutor.id}"${tutor.id === focusTutorId ? ' open' : ''}>
      <summary>
        <span><strong>${escapeHtml(tutor.en.name || 'Untitled tutor')}</strong><small>${escapeHtml(tutor.en.role || 'Add tutor details')}${tutor.hidden ? ' · Hidden from website' : ''}</small></span>
        <span class="summary-action">Edit</span>
      </summary>
      <div class="tutor-settings">
        <label class="editor-field"><span>Website section</span><select data-tutor-group="${tutor.id}"><option value="english"${tutor.group === 'english' ? ' selected' : ''}>English</option><option value="maths"${tutor.group === 'maths' ? ' selected' : ''}>Maths &amp; Science</option></select></label>
        <button class="${tutor.hidden ? 'secondary' : 'danger'}" type="button" data-toggle-tutor="${tutor.id}">${tutor.hidden ? 'Show on website' : 'Hide from website'}</button>
      </div>
      <div class="language-grid">
        <section><h3>English details</h3>${tutorFields.map((field) => tutorField(tutor, 'en', field)).join('')}</section>
        <section><h3>中文资料</h3>${tutorFields.map((field) => tutorField(tutor, 'zh', field)).join('')}</section>
      </div>
    </details>`).join('');

  document.querySelectorAll('[data-tutor-id]').forEach((input) => input.addEventListener('input', () => {
    const tutor = content.tutors.find((item) => item.id === input.dataset.tutorId);
    tutor[input.dataset.lang][input.dataset.field] = input.value;
    markDirty();
  }));
  document.querySelectorAll('[data-tutor-group]').forEach((select) => select.addEventListener('change', () => {
    content.tutors.find((item) => item.id === select.dataset.tutorGroup).group = select.value;
    markDirty();
  }));
  document.querySelectorAll('[data-toggle-tutor]').forEach((button) => button.addEventListener('click', () => {
    const tutor = content.tutors.find((item) => item.id === button.dataset.toggleTutor);
    tutor.hidden = !tutor.hidden;
    focusTutorId = tutor.id;
    markDirty();
    renderTutors();
  }));
  focusTutorId = null;
}

function addTutor() {
  const blank = Object.fromEntries(tutorFields.map(([field]) => [field, '']));
  const tutor = {
    id: makeId('tutor'),
    group: 'english',
    hidden: false,
    en: { ...blank },
    zh: { ...blank }
  };
  content.tutors.push(tutor);
  focusTutorId = tutor.id;
  markDirty();
  renderTutors();
  document.querySelector(`[data-editor-id="${tutor.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function priceInput(subject, row, index, value) {
  return `<input type="number" min="1" max="10000" step="0.01" aria-label="${escapeHtml(row.labelEn)} price ${index + 1}" data-price-subject="${subject}" data-price-id="${row.id}" data-price-index="${index}" value="${value ?? ''}">`;
}

function renderPriceRows(subject) {
  $(`#${subject}-prices`).innerHTML = content.pricing[subject].map((row) => `
    <tr>
      <td><input type="text" aria-label="English row name" data-price-label="labelEn" data-price-subject="${subject}" data-price-id="${row.id}" value="${escapeHtml(row.labelEn)}" required></td>
      <td><input type="text" aria-label="Chinese row name" data-price-label="labelZh" data-price-subject="${subject}" data-price-id="${row.id}" value="${escapeHtml(row.labelZh)}" required></td>
      ${row.values.map((value, index) => `<td>${priceInput(subject, row, index, value)}</td>`).join('')}
      <td><button class="danger compact" type="button" data-remove-price="${subject}:${row.id}">Delete</button></td>
    </tr>`).join('');

  document.querySelectorAll(`[data-price-subject="${subject}"]`).forEach((input) => input.addEventListener('input', () => {
    const row = content.pricing[subject].find((item) => item.id === input.dataset.priceId);
    if (input.dataset.priceLabel) row[input.dataset.priceLabel] = input.value;
    else row.values[Number(input.dataset.priceIndex)] = input.value === '' ? null : Number(input.value);
    markDirty();
  }));
  document.querySelectorAll(`[data-remove-price^="${subject}:"]`).forEach((button) => button.addEventListener('click', () => {
    const [, rowId] = button.dataset.removePrice.split(':');
    const row = content.pricing[subject].find((item) => item.id === rowId);
    if (!window.confirm(`Delete the price row “${row.labelEn}”?`)) return;
    content.pricing[subject] = content.pricing[subject].filter((item) => item.id !== rowId);
    markDirty();
    renderPriceRows(subject);
  }));
}

function addPriceRow(subject) {
  content.pricing[subject].push({
    id: makeId('rate'),
    labelEn: 'New tutor',
    labelZh: '新导师',
    values: [null, null, null, null]
  });
  markDirty();
  renderPriceRows(subject);
  $(`#${subject}-prices tr:last-child input`)?.focus();
}

function render() {
  renderTutors();
  renderPriceRows('english');
  renderPriceRows('maths');
  $('#group-english').value = content.groupClasses.english;
  $('#group-mathematics').value = content.groupClasses.mathematics;
  [$('#group-english'), $('#group-mathematics')].forEach((input) => input.addEventListener('input', () => {
    content.groupClasses[input.id === 'group-english' ? 'english' : 'mathematics'] = Number(input.value);
    markDirty();
  }));
}

async function loadAdmin(session) {
  $('#account-email').textContent = session.email;
  content = await request('/api/content');
  dirty = false;
  $('#save-hint').textContent = content.updatedAt
    ? `Last saved ${new Date(content.updatedAt).toLocaleString()}`
    : 'Changes are not published until you save.';
  render();
  show('admin');
}

$('#add-tutor').addEventListener('click', addTutor);
$('#add-english-rate').addEventListener('click', () => addPriceRow('english'));
$('#add-maths-rate').addEventListener('click', () => addPriceRow('maths'));

$('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const error = $('#login-error');
  error.hidden = true;
  const button = event.submitter;
  button.disabled = true;
  button.textContent = 'Signing in...';
  try {
    const session = await request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email: $('#email').value, password: $('#password').value })
    });
    await loadAdmin(session);
    $('#password').value = '';
  } catch (caught) {
    error.textContent = caught.message;
    error.hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = 'Sign in';
  }
});

$('#save').addEventListener('click', async () => {
  const button = $('#save');
  button.disabled = true;
  button.textContent = 'Saving...';
  setMessage('');
  try {
    content = await request('/api/content', { method: 'PUT', body: JSON.stringify(content) });
    dirty = false;
    $('#save-hint').textContent = `Last saved ${new Date(content.updatedAt).toLocaleString()}`;
    setMessage('Saved. The public website now uses these details.');
    render();
  } catch (caught) {
    if (caught.status === 401) show('login');
    setMessage(caught.message, 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Save changes';
  }
});

$('#logout').addEventListener('click', async () => {
  if (dirty && !window.confirm('You have unpublished changes. Sign out anyway?')) return;
  await request('/api/logout', { method: 'POST' }).catch(() => {});
  content = null;
  show('login');
});

window.addEventListener('beforeunload', (event) => {
  if (!dirty) return;
  event.preventDefault();
  event.returnValue = '';
});

(async () => {
  try {
    await loadAdmin(await request('/api/session'));
  } catch {
    show('login');
  }
})();
