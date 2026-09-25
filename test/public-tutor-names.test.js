import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('public tutor pages show first names only', () => {
  const directory = readFileSync(new URL('../tutors/index.html', import.meta.url), 'utf8');
  const subjectPage = readFileSync(new URL('../tutoring/physics/index.html', import.meta.url), 'utf8');

  assert.match(directory, /<h2>Kevin<\/h2>/);
  assert.match(directory, /<h2>Yvonne<\/h2>/);
  assert.doesNotMatch(directory, /<h2>Kevin Zhang<\/h2>|<h2>Dr Yvonne Smith<\/h2>/);
  assert.match(subjectPage, /<h3>Christopher<\/h3>/);
  assert.doesNotMatch(subjectPage, /<h3>Christopher Du<\/h3>/);
});

for (const page of ['Academy One.dc.html', 'index.html']) {
  test(`${page} limits tutor and timetable display names to first names`, () => {
    const html = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8');
    assert.match(html, /name: this\.firstName\(tutor\.en\.name\)/);
    assert.match(html, /tutor: this\.firstName\(c\.tutor\)/);
  });
}
