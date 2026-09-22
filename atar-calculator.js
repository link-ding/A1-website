const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function curve(offset = 0, units = 2) {
  const unitWeight = units / 2;
  return [
    { x: 0, y: 0 },
    { x: 50, y: clamp(42 + offset * 0.45, 0, 100) },
    { x: 60, y: clamp(51 + offset * 0.6, 0, 100) },
    { x: 70, y: clamp(61 + offset * 0.75, 0, 100) },
    { x: 80, y: clamp(72 + offset * 0.9, 0, 100) },
    { x: 90, y: clamp(84 + offset, 0, 100) },
    { x: 100, y: clamp(96 + offset * 0.35, 0, 100) }
  ].map(point => ({ ...point, y: point.y * unitWeight }));
}

export const courses = [
  { id: 'eng-standard', name: 'English Standard', units: 2, english: true, offset: -5 },
  { id: 'eng-advanced', name: 'English Advanced', units: 2, english: true, offset: 2 },
  { id: 'eng-eald', name: 'English EAL/D', units: 2, english: true, offset: 0 },
  { id: 'eng-ext-1', name: 'English Extension 1', units: 1, english: true, offset: 7 },
  { id: 'eng-ext-2', name: 'English Extension 2', units: 1, english: true, offset: 8 },
  { id: 'math-standard-2', name: 'Mathematics Standard 2', units: 2, english: false, offset: -3 },
  { id: 'math-advanced', name: 'Mathematics Advanced', units: 2, english: false, offset: 3 },
  { id: 'math-ext-1', name: 'Mathematics Extension 1', units: 1, english: false, offset: 8 },
  { id: 'math-ext-2', name: 'Mathematics Extension 2', units: 1, english: false, offset: 12 },
  { id: 'biology', name: 'Biology', units: 2, english: false, offset: 0 },
  { id: 'chemistry', name: 'Chemistry', units: 2, english: false, offset: 5 },
  { id: 'physics', name: 'Physics', units: 2, english: false, offset: 5 },
  { id: 'economics', name: 'Economics', units: 2, english: false, offset: 5 },
  { id: 'business', name: 'Business Studies', units: 2, english: false, offset: -2 },
  { id: 'legal', name: 'Legal Studies', units: 2, english: false, offset: -1 },
  { id: 'modern-history', name: 'Modern History', units: 2, english: false, offset: 0 },
  { id: 'ancient-history', name: 'Ancient History', units: 2, english: false, offset: -1 },
  { id: 'geography', name: 'Geography', units: 2, english: false, offset: 0 },
  { id: 'pdhpe', name: 'PDHPE', units: 2, english: false, offset: -4 },
  { id: 'society-culture', name: 'Society and Culture', units: 2, english: false, offset: -3 },
  { id: 'visual-arts', name: 'Visual Arts', units: 2, english: false, offset: -2 },
  { id: 'music-1', name: 'Music 1', units: 2, english: false, offset: -2 },
  { id: 'software-engineering', name: 'Software Engineering', units: 2, english: false, offset: 1 },
  { id: 'investigating-science', name: 'Investigating Science', units: 2, english: false, offset: -4 }
].map(course => ({ ...course, scalingCurve: curve(course.offset, course.units) }));

export const aggregateCurve = [
  { x: 0, y: 0 },
  { x: 180, y: 30 },
  { x: 220, y: 50 },
  { x: 260, y: 62 },
  { x: 300, y: 75 },
  { x: 340, y: 84 },
  { x: 380, y: 92 },
  { x: 420, y: 97 },
  { x: 460, y: 99.3 },
  { x: 500, y: 99.95 }
];

export function linearInterpolate(points, x) {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  if (!sorted.length) throw new Error('No interpolation points');
  if (x <= sorted[0].x) return sorted[0].y;
  if (x >= sorted.at(-1).x) return sorted.at(-1).y;
  for (let index = 0; index < sorted.length - 1; index += 1) {
    const start = sorted[index];
    const end = sorted[index + 1];
    if (x >= start.x && x <= end.x) {
      return start.y + ((x - start.x) / (end.x - start.x)) * (end.y - start.y);
    }
  }
  throw new Error('Interpolation failed');
}

export function calculateAtar(inputs) {
  const unitScores = inputs.flatMap(input => {
    if (!Number.isFinite(input.mark) || input.mark < 0 || input.mark > 100) {
      throw new Error('Each HSC mark must be between 0–100.');
    }
    const scaledCourseMark = linearInterpolate(input.scalingCurve, clamp(input.mark, 0, 100));
    const scaledPerUnit = scaledCourseMark / input.units;
    return Array.from({ length: input.units }, () => ({
      courseId: input.id,
      name: input.name,
      english: input.english,
      scaledPerUnit
    }));
  });
  const englishUnits = unitScores.filter(unit => unit.english).sort((a, b) => b.scaledPerUnit - a.scaledPerUnit);
  if (englishUnits.length < 2) throw new Error('Add at least 2 units of English.');
  if (unitScores.length < 10) throw new Error('Add at least 10 units.');

  const mandatoryEnglish = englishUnits.slice(0, 2);
  const selectedEnglish = new Set(mandatoryEnglish);
  const remaining = unitScores
    .filter(unit => !selectedEnglish.has(unit))
    .sort((a, b) => b.scaledPerUnit - a.scaledPerUnit)
    .slice(0, 8);
  const selected = [...mandatoryEnglish, ...remaining];
  const aggregate = selected.reduce((sum, unit) => sum + unit.scaledPerUnit, 0);
  const atar = clamp(linearInterpolate(aggregateCurve, aggregate), 0, 99.95);
  const counted = [...new Set(selected.map(unit => unit.courseId))];
  return { atar, aggregate, counted, selected };
}

const defaults = [
  ['eng-advanced', 84],
  ['math-advanced', 86],
  ['chemistry', 82],
  ['physics', 80],
  ['economics', 84],
  ['biology', 83]
];

function initCalculator() {
  const rows = document.querySelector('#course-rows');
  const template = document.querySelector('#course-row-template');
  const resultValue = document.querySelector('#atar-value');
  const aggregateValue = document.querySelector('#aggregate-value');
  const resultState = document.querySelector('#result-state');
  const countedList = document.querySelector('#counted-list');
  const addButton = document.querySelector('#add-course');
  const form = document.querySelector('#atar-form');
  let rowId = 0;

  const optionMarkup = courses.map(course =>
    `<option value="${course.id}">${course.name} · ${course.units} unit${course.units === 1 ? '' : 's'}</option>`
  ).join('');

  function updateResult() {
    const seen = new Set();
    const inputs = [];
    let duplicate = false;
    rows.querySelectorAll('.course-row').forEach(row => {
      const course = courses.find(item => item.id === row.querySelector('select').value);
      const markField = row.querySelector('input');
      const mark = markField.value.trim() === '' ? Number.NaN : Number(markField.value);
      row.classList.toggle('is-duplicate', seen.has(course.id));
      if (seen.has(course.id)) duplicate = true;
      seen.add(course.id);
      inputs.push({ ...course, mark });
    });

    if (duplicate) {
      setError('Each course can only be added once.');
      return;
    }

    try {
      const result = calculateAtar(inputs);
      resultValue.textContent = result.atar.toFixed(2);
      aggregateValue.textContent = `${result.aggregate.toFixed(1)} / 500`;
      resultState.textContent = 'Updated using your best 10 units';
      resultState.dataset.state = 'ready';
      countedList.innerHTML = inputs.map(input => {
        const counted = result.counted.includes(input.id);
        return `<li class="${counted ? 'is-counted' : ''}"><span>${input.name}</span><strong>${counted ? 'Counted' : 'Not counted'}</strong></li>`;
      }).join('');
    } catch (error) {
      setError(error.message);
    }
  }

  function setError(message) {
    resultValue.textContent = '—';
    aggregateValue.textContent = '— / 500';
    resultState.textContent = message;
    resultState.dataset.state = 'error';
    countedList.innerHTML = '';
  }

  function addRow(courseId = courses[0].id, mark = 80) {
    const fragment = template.content.cloneNode(true);
    const row = fragment.querySelector('.course-row');
    const select = row.querySelector('select');
    const input = row.querySelector('input');
    const remove = row.querySelector('button');
    const labelId = `course-${rowId += 1}`;
    select.id = labelId;
    select.setAttribute('aria-label', 'Course');
    select.innerHTML = optionMarkup;
    select.value = courseId;
    input.value = mark;
    input.setAttribute('aria-label', `${courses.find(course => course.id === courseId)?.name || 'Course'} HSC mark`);
    select.addEventListener('change', () => {
      input.setAttribute('aria-label', `${courses.find(course => course.id === select.value).name} HSC mark`);
      updateResult();
    });
    input.addEventListener('input', updateResult);
    remove.addEventListener('click', () => {
      row.remove();
      updateResult();
    });
    rows.append(fragment);
  }

  defaults.forEach(([course, mark]) => addRow(course, mark));
  addButton.addEventListener('click', () => addRow());
  form.addEventListener('submit', event => {
    event.preventDefault();
    updateResult();
    document.querySelector('#result-panel').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  });
  updateResult();
}

if (typeof document !== 'undefined') initCalculator();
