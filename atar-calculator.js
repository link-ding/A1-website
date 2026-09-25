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
  { id: 'eng-standard', name: 'English Standard', units: 2, english: true, subjectArea: 'english', offset: -5 },
  { id: 'eng-advanced', name: 'English Advanced', units: 2, english: true, subjectArea: 'english', offset: 2 },
  { id: 'eng-eald', name: 'English EAL/D', units: 2, english: true, subjectArea: 'english', offset: 0 },
  { id: 'eng-ext-1', name: 'English Extension 1', units: 1, english: true, subjectArea: 'english', offset: 7 },
  { id: 'eng-ext-2', name: 'English Extension 2', units: 1, english: true, subjectArea: 'english', offset: 8 },
  { id: 'math-standard-2', name: 'Mathematics Standard 2', units: 2, english: false, subjectArea: 'mathematics', offset: -3 },
  { id: 'math-advanced', name: 'Mathematics Advanced', units: 2, english: false, subjectArea: 'mathematics', offset: 3 },
  { id: 'math-ext-1', name: 'Mathematics Extension 1', units: 1, english: false, subjectArea: 'mathematics', offset: 8 },
  { id: 'math-ext-2', name: 'Mathematics Extension 2', units: 2, english: false, subjectArea: 'mathematics', offset: 12 },
  { id: 'biology', name: 'Biology', units: 2, english: false, subjectArea: 'biology', offset: 0 },
  { id: 'chemistry', name: 'Chemistry', units: 2, english: false, subjectArea: 'chemistry', offset: 5 },
  { id: 'physics', name: 'Physics', units: 2, english: false, subjectArea: 'physics', offset: 5 },
  { id: 'economics', name: 'Economics', units: 2, english: false, subjectArea: 'economics', offset: 5 },
  { id: 'business', name: 'Business Studies', units: 2, english: false, subjectArea: 'business-studies', offset: -2 },
  { id: 'legal', name: 'Legal Studies', units: 2, english: false, subjectArea: 'legal-studies', offset: -1 },
  { id: 'modern-history', name: 'Modern History', units: 2, english: false, subjectArea: 'modern-history', offset: 0 },
  { id: 'ancient-history', name: 'Ancient History', units: 2, english: false, subjectArea: 'ancient-history', offset: -1 },
  { id: 'geography', name: 'Geography', units: 2, english: false, subjectArea: 'geography', offset: 0 },
  { id: 'health-movement-science', name: 'Health and Movement Science', units: 2, english: false, subjectArea: 'health-and-movement-science', offset: -4 },
  { id: 'society-culture', name: 'Society and Culture', units: 2, english: false, subjectArea: 'society-and-culture', offset: -3 },
  { id: 'visual-arts', name: 'Visual Arts', units: 2, english: false, subjectArea: 'visual-arts', offset: -2 },
  { id: 'music-1', name: 'Music 1', units: 2, english: false, subjectArea: 'music', offset: -2 },
  { id: 'software-engineering', name: 'Software Engineering', units: 2, english: false, subjectArea: 'software-engineering', offset: 1 },
  { id: 'investigating-science', name: 'Investigating Science', units: 2, english: false, subjectArea: 'investigating-science', offset: -4 }
].map(course => ({ ...course, scalingCurve: curve(course.offset, course.units) }));

export const modelVersion = 'Academy One simulation 2026.09';

function markMaximum(courseId, hasMathExtension2) {
  if (courseId === 'eng-ext-1' || courseId === 'eng-ext-2') return 50;
  if (courseId === 'math-ext-1' && !hasMathExtension2) return 50;
  return 100;
}

function validateCourseCombination(inputs) {
  const ids = new Set(inputs.map(input => input.id));
  const baseEnglish = ['eng-standard', 'eng-advanced', 'eng-eald'].filter(id => ids.has(id));
  if (baseEnglish.length > 1) throw new Error('Choose only one 2-unit English course.');
  if (ids.has('eng-ext-1') && !ids.has('eng-advanced')) {
    throw new Error('English Extension 1 requires English Advanced.');
  }
  if (ids.has('eng-ext-2') && (!ids.has('eng-advanced') || !ids.has('eng-ext-1'))) {
    throw new Error('English Extension 2 requires English Advanced and Extension 1.');
  }

  if (ids.has('math-standard-2') && (ids.has('math-advanced') || ids.has('math-ext-1') || ids.has('math-ext-2'))) {
    throw new Error('Mathematics Standard 2 cannot be combined with Advanced or Extension courses.');
  }
  if (ids.has('math-ext-1') && !ids.has('math-ext-2') && !ids.has('math-advanced')) {
    throw new Error('Mathematics Extension 1 requires Mathematics Advanced.');
  }
  if (ids.has('math-ext-2') && !ids.has('math-ext-1')) {
    throw new Error('Mathematics Extension 2 requires Mathematics Extension 1.');
  }
  if (ids.has('math-ext-2') && ids.has('math-advanced')) {
    throw new Error('For an Extension 2 pattern, enter Mathematics Extension 1 and Extension 2 without Mathematics Advanced.');
  }
}

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
  validateCourseCombination(inputs);
  const hasMathExtension2 = inputs.some(input => input.id === 'math-ext-2');
  const normalisedInputs = inputs.map(input => {
    const units = hasMathExtension2 && input.id === 'math-ext-1' ? 2 : input.units;
    return { ...input, units, scalingCurve: curve(input.offset, units) };
  });
  const unitScores = normalisedInputs.flatMap(input => {
    const maximum = markMaximum(input.id, hasMathExtension2);
    if (!Number.isFinite(input.mark) || input.mark < 0 || input.mark > maximum) {
      throw new Error(`${input.name} HSC mark must be between 0–${maximum}.`);
    }
    const scaledCourseMark = linearInterpolate(input.scalingCurve, input.mark * 100 / maximum);
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
  if (new Set(normalisedInputs.map(input => input.subjectArea)).size < 4) {
    throw new Error('ATAR eligibility requires courses from at least 4 subject areas.');
  }
  if (normalisedInputs.filter(input => input.units >= 2).length < 3) {
    throw new Error('ATAR eligibility requires at least 3 courses of 2 units or more.');
  }

  const mandatoryEnglish = englishUnits.slice(0, 2);
  const selectedEnglish = new Set(mandatoryEnglish);
  const remaining = unitScores
    .filter(unit => !selectedEnglish.has(unit))
    .sort((a, b) => b.scaledPerUnit - a.scaledPerUnit)
    .slice(0, 8);
  const selected = [...mandatoryEnglish, ...remaining];
  const aggregate = selected.reduce((sum, unit) => sum + unit.scaledPerUnit, 0);
  const atar = Math.round(clamp(linearInterpolate(aggregateCurve, aggregate), 0, 99.95) * 20) / 20;
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

const chineseCourseNames = {
  'eng-standard':'英语标准 English Standard','eng-advanced':'英语高级 English Advanced','eng-eald':'英语 EAL/D','eng-ext-1':'英语 Extension 1','eng-ext-2':'英语 Extension 2',
  'math-standard-2':'数学标准 Mathematics Standard 2','math-advanced':'数学高级 Mathematics Advanced','math-ext-1':'数学 Extension 1','math-ext-2':'数学 Extension 2',
  biology:'生物 Biology',chemistry:'化学 Chemistry',physics:'物理 Physics',economics:'经济学 Economics',business:'商业研究 Business Studies',legal:'法律研究 Legal Studies',
  'modern-history':'现代史 Modern History','ancient-history':'古代史 Ancient History',geography:'地理 Geography','health-movement-science':'健康与运动科学 Health and Movement Science',
  'society-culture':'社会与文化 Society and Culture','visual-arts':'视觉艺术 Visual Arts','music-1':'音乐 Music 1','software-engineering':'软件工程 Software Engineering','investigating-science':'科学探究 Investigating Science'
};

const chineseErrors = new Map([
  ['Choose only one 2-unit English course.','只能选择一门 2-unit 英语课程。'],
  ['English Extension 1 requires English Advanced.','English Extension 1 必须与 English Advanced 一起选择。'],
  ['English Extension 2 requires English Advanced and Extension 1.','English Extension 2 必须与 English Advanced 和 Extension 1 一起选择。'],
  ['Mathematics Standard 2 cannot be combined with Advanced or Extension courses.','Mathematics Standard 2 不能与 Advanced 或 Extension 课程同时选择。'],
  ['Mathematics Extension 1 requires Mathematics Advanced.','Mathematics Extension 1 必须与 Mathematics Advanced 一起选择。'],
  ['Mathematics Extension 2 requires Mathematics Extension 1.','Mathematics Extension 2 必须与 Mathematics Extension 1 一起选择。'],
  ['For an Extension 2 pattern, enter Mathematics Extension 1 and Extension 2 without Mathematics Advanced.','选择 Extension 2 组合时，请输入 Mathematics Extension 1 和 Extension 2，不要再添加 Mathematics Advanced。'],
  ['Add at least 2 units of English.','请添加至少 2 units 英语。'],
  ['Add at least 10 units.','请添加至少 10 units。'],
  ['ATAR eligibility requires courses from at least 4 subject areas.','ATAR 资格要求课程至少涵盖 4 个学科领域。'],
  ['ATAR eligibility requires at least 3 courses of 2 units or more.','ATAR 资格要求至少有 3 门课程为 2 units 或以上。'],
  ['Each course can only be added once.','每门课程只能添加一次。']
]);

function localizeCalculatorError(message,isChinese){
  if(!isChinese)return message;
  if(chineseErrors.has(message))return chineseErrors.get(message);
  const match=message.match(/^(.+) HSC mark must be between (.+)\.$/);
  if(!match)return message;
  const course=courses.find(item=>item.name===match[1]);
  return `${course?chineseCourseNames[course.id]:match[1]} 的 HSC 成绩必须在 ${match[2]} 之间。`;
}

function initCalculator() {
  const isChinese=document.documentElement.lang.startsWith('zh');
  try{localStorage.setItem('academy-one-language',isChinese?'zh':'en');}catch{}
  const courseName=course=>isChinese?chineseCourseNames[course.id]:course.name;
  const rows = document.querySelector('#course-rows');
  const template = document.querySelector('#course-row-template');
  const resultValue = document.querySelector('#atar-value');
  const aggregateValue = document.querySelector('#aggregate-value');
  const resultState = document.querySelector('#result-state');
  const countedList = document.querySelector('#counted-list');
  const addButton = document.querySelector('#add-course');
  const form = document.querySelector('#atar-form');
  let rowId = 0;

  const optionMarkup = courses.map(course => {
    const units = course.id === 'math-ext-1'
      ? (isChinese?'1 unit（与 Extension 2 搭配时为 2 units）':'1 unit (2 with Extension 2)')
      : `${course.units} unit${course.units === 1 ? '' : 's'}`;
    return `<option value="${course.id}">${courseName(course)} · ${units}</option>`;
  }).join('');

  function syncMarkFields() {
    const hasMathExtension2 = [...rows.querySelectorAll('select')].some(select => select.value === 'math-ext-2');
    rows.querySelectorAll('.course-row').forEach(row => {
      const course = courses.find(item => item.id === row.querySelector('select').value);
      const input = row.querySelector('input');
      const maximum = markMaximum(course.id, hasMathExtension2);
      const previousMaximum = Number(input.max);
      if (course.id === 'math-ext-1' && previousMaximum !== maximum && input.value.trim() !== '') {
        input.value = String(Number(input.value) * maximum / previousMaximum);
      }
      input.max = maximum;
      input.placeholder = `0–${maximum}`;
      input.title = isChinese?`${courseName(course)} HSC 成绩（满分 ${maximum}）`:`${course.name} HSC mark out of ${maximum}`;
      input.setAttribute('aria-label',isChinese?`${courseName(course)} HSC 成绩（0–${maximum}）`:`${course.name} HSC mark (0–${maximum})`);
    });
  }

  function updateResult() {
    syncMarkFields();
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
      resultState.textContent = isChinese?'使用最佳 10 units 的模拟结果':'Simulation using your best 10 units';
      resultState.dataset.state = 'ready';
      countedList.innerHTML = inputs.map(input => {
        const counted = result.counted.includes(input.id);
        return `<li class="${counted ? 'is-counted' : ''}"><span>${courseName(input)}</span><strong>${counted ? (isChinese?'已计入':'Counted') : (isChinese?'未计入':'Not counted')}</strong></li>`;
      }).join('');
    } catch (error) {
      setError(error.message);
    }
  }

  function setError(message) {
    resultValue.textContent = '—';
    aggregateValue.textContent = '— / 500';
    resultState.textContent = localizeCalculatorError(message,isChinese);
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
    select.setAttribute('aria-label',isChinese?'课程':'Course');
    select.innerHTML = optionMarkup;
    select.value = courseId;
    input.value = mark;
    input.max = markMaximum(courseId, [...rows.querySelectorAll('select')].some(item => item.value === 'math-ext-2'));
    select.addEventListener('change', () => {
      input.value = '';
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
  addButton.addEventListener('click', () => {
    addRow();
    updateResult();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    updateResult();
    document.querySelector('#result-panel').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  });
  updateResult();
}

if (typeof document !== 'undefined') initCalculator();
