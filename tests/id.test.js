const test = require('node:test');
const assert = require('node:assert/strict');

(async () => {
  const mod = await import('../src/utils/id.js');
  const { generateId } = mod;

  test('generateId returns prefixed id', () => {
    const value = generateId('user');
    assert.equal(value.startsWith('user_'), true);
  });

  test('generateId returns unique values over many calls', () => {
    const seen = new Set();
    for (let i = 0; i < 500; i += 1) {
      seen.add(generateId('t'));
    }
    assert.equal(seen.size, 500);
  });
})();
