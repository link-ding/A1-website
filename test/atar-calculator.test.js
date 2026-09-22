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
});
