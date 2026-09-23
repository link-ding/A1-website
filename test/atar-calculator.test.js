import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateCurve, calculateAtar, courses, linearInterpolate } from '../atar-calculator.js';

const withMark = (id, mark) => ({ ...courses.find(course => course.id === id), mark });

test('linearly interpolates between curve points', () => {
  assert.equal(linearInterpolate([{ x: 0, y: 0 }, { x: 100, y: 50 }], 40), 20);
  assert.equal(linearInterpolate(aggregateCurve, 500), 99.95);
});

test('requires two English units and ten total units', () => {
  const noEnglish = ['biology', 'chemistry', 'physics', 'economics', 'business'].map(id => withMark(id, 80));
  assert.throws(() => calculateAtar(noEnglish), /English/);
  assert.throws(() => calculateAtar([withMark('eng-advanced', 80)]), /10 units/);
});

test('rejects marks outside the HSC range', () => {
  assert.throws(() => calculateAtar([withMark('eng-advanced', 101)]), /0–100/);
});

test('uses 50-mark Extension results except Mathematics Extension 1 with Extension 2', () => {
  const otherCourses = ['eng-advanced', 'biology', 'chemistry', 'physics', 'economics'].map(id => withMark(id, 80));
  assert.throws(() => calculateAtar([...otherCourses, withMark('eng-ext-1', 51)]), /0–50/);
  assert.throws(() => calculateAtar([...otherCourses, withMark('math-advanced', 80), withMark('math-ext-1', 51)]), /0–50/);

  const result = calculateAtar([...otherCourses, withMark('eng-ext-1', 40)]);
  const englishExtensionUnit = result.selected.find(unit => unit.courseId === 'eng-ext-1');
  assert.equal(englishExtensionUnit.scaledPerUnit, linearInterpolate(courses.find(course => course.id === 'eng-ext-1').scalingCurve, 80));
  assert.doesNotThrow(() => calculateAtar([...otherCourses, withMark('math-ext-1', 80), withMark('math-ext-2', 80)]));
});

test('selects ten units while retaining compulsory English', () => {
  const inputs = [
    withMark('eng-standard', 60),
    withMark('math-advanced', 95),
    withMark('chemistry', 95),
    withMark('physics', 95),
    withMark('economics', 95),
    withMark('biology', 95)
  ];
  const result = calculateAtar(inputs);
  assert.equal(result.selected.length, 10);
  assert.equal(result.selected.filter(unit => unit.english).length, 2);
  assert.ok(result.counted.includes('eng-standard'));
  assert.ok(result.atar > 0 && result.atar <= 99.95);
  assert.equal(result.atar * 20, Math.round(result.atar * 20));
});

test('enforces English Extension prerequisites', () => {
  const otherCourses = ['biology', 'chemistry', 'physics', 'economics'].map(id => withMark(id, 80));
  assert.throws(
    () => calculateAtar([withMark('eng-ext-1', 80), ...otherCourses]),
    /English Advanced/
  );
  assert.throws(
    () => calculateAtar([withMark('eng-advanced', 80), withMark('eng-ext-2', 80), ...otherCourses]),
    /Extension 1/
  );
});

test('applies the Mathematics Extension 2 pattern as four units', () => {
  const inputs = [
    withMark('eng-advanced', 80),
    withMark('math-ext-1', 80),
    withMark('math-ext-2', 80),
    withMark('biology', 80),
    withMark('chemistry', 80),
    withMark('physics', 80)
  ];
  const result = calculateAtar(inputs);
  assert.equal(result.selected.length, 10);
  assert.throws(
    () => calculateAtar([withMark('eng-advanced', 80), withMark('math-ext-2', 80), withMark('biology', 80), withMark('chemistry', 80), withMark('physics', 80)]),
    /Mathematics Extension 1/
  );
});

test('checks the four subject-area eligibility rule', () => {
  const inputs = [
    withMark('eng-advanced', 80),
    withMark('eng-ext-1', 40),
    withMark('eng-ext-2', 40),
    withMark('math-ext-1', 80),
    withMark('math-ext-2', 80),
    withMark('biology', 80)
  ];
  assert.throws(() => calculateAtar(inputs), /4 subject areas/);
});

test('counts Ancient and Modern History as separate subject areas', () => {
  const inputs = [
    withMark('eng-advanced', 80),
    withMark('eng-ext-1', 40),
    withMark('eng-ext-2', 40),
    withMark('ancient-history', 80),
    withMark('modern-history', 80),
    withMark('biology', 80)
  ];
  assert.doesNotThrow(() => calculateAtar(inputs));
});
