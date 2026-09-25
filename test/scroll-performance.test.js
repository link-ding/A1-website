import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

for (const page of ['Academy One.dc.html', 'index.html']) {
  test(`${page} updates count-up numbers without re-rendering the page every frame`, () => {
    const html = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8');
    const start = html.indexOf('      const start = performance.now();');
    const end = html.indexOf('\n      }, { threshold: 0.25 });', start);
    assert.ok(start !== -1 && end !== -1);
    const animation = html.slice(start, end);
    const elements = [
      { dataset: { countup: '99.85', decimals: '2' }, textContent: '0.00' },
      ...['98', '91', '92'].map(countup => ({ dataset: { countup }, textContent: '0' }))
    ];
    const frames = [];
    const run = new Function('performance', 'document', 'requestAnimationFrame', `return function() { ${animation} }`)(
      { now: () => 0 },
      { querySelectorAll: () => elements },
      callback => frames.push(callback)
    );
    run();

    frames.shift()(800);
    assert.deepEqual(elements.map(element => element.textContent), ['87.37', 86, 80, 81]);

    frames.shift()(1600);
    assert.deepEqual(elements.map(element => element.textContent), ['99.85', 98, 91, 92]);
  });

  test(`${page} renders final stats before optional animation starts`, () => {
    const html = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8');
    assert.match(html, /statsProgress: 1/);
    assert.match(html, /stats && 'IntersectionObserver' in window/);
    assert.match(html, /this\.statsObserver\?\.disconnect\(\)/);
  });
}
