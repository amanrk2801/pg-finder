// CommonJS so the same module works in the app bundle (Metro interops CJS)
// and in Node's test runner without a transpile step.
function generateId(prefix = 'id') {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `${prefix}_${crypto.randomUUID()}`;
    }
    const randomPart = Math.random().toString(36).slice(2, 10);
    return `${prefix}_${Date.now().toString(36)}_${randomPart}`;
}

module.exports = { generateId };
