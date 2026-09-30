const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const code = fs.readFileSync(path.join(__dirname, '../integrations/google-sheets/Code.gs'), 'utf8');
const valid = {
  email: 'researcher@example.com', name: 'Researcher', affiliation: 'University',
  dataset: 'tax-effectiveness', updates: 'no', website: '', request_id: '12345678-1234-1234-1234-123456789abc'
};

function service(options = {}) {
  const rows = [];
  let held = false;
  const sheet = {
    getLastRow: () => rows.length + 1,
    appendRow: row => { if (options.failWrite) throw new Error('Unavailable'); rows.push(row); },
    getRange: () => ({ createTextFinder: id => ({ matchEntireCell: () => ({ findNext: () => rows.find(row => row[6] === id) || null }) }) })
  };
  const context = vm.createContext({
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => options.unconfigured ? '' : 'private-sheet' }) },
    LockService: { getScriptLock: () => ({ tryLock: () => (held = !options.busy), hasLock: () => held, releaseLock: () => { held = false; } }) },
    SpreadsheetApp: { openById: () => ({ getSheetByName: () => sheet }), flush: () => {} },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) }
  });
  vm.runInContext(code, context);
  return { rows, post: data => context.doPost({ parameter: data }), get: () => context.doGet(), held: () => held };
}

test('records required identity and selected data without echoing personal details', () => {
  const app = service();
  assert.deepEqual(app.post(valid), { ok: true, requestId: valid.request_id });
  assert.equal(app.rows.length, 1);
  assert.equal(app.rows[0][1], valid.email);
  assert.equal(app.rows[0][4], 'Tax Effectiveness Scores');
  assert.equal(app.rows[0][5], 'No');
  assert.equal(app.held(), false);
  assert.deepEqual(app.get(), { ok: true, service: 'Download registration' });
});

test('ignores a legacy update flag and does not subscribe users', () => {
  const app = service();
  assert.equal(app.post({ ...valid, updates: 'yes' }).ok, true);
  assert.equal(app.rows[0][4], 'Tax Effectiveness Scores');
  assert.equal(app.rows[0][5], 'No');
});

test('retries with the same request ID do not append duplicate entries', () => {
  const app = service();
  app.post(valid);
  assert.equal(app.post(valid).ok, true);
  assert.equal(app.rows.length, 1);
});

test('invalid fields and bot submissions never create a row', () => {
  for (const change of [
    { email: '' }, { email: 'invalid' }, { email: 'test@invalid' },
    { email: 'a'.repeat(255) + '@example.com' },
    { name: '' }, { name: '   ' }, { affiliation: '' }, { affiliation: '   ' },
    { name: 'a'.repeat(121) }, { affiliation: 'a'.repeat(201) },
    { dataset: '../private' }, { dataset: '__proto__' }, { dataset: 'both' },
    { request_id: '' }, { website: 'spam.example' }
  ]) {
    const app = service();
    assert.equal(app.post({ ...valid, ...change }).ok, false);
    assert.equal(app.rows.length, 0);
  }
});

test('spreadsheet formulas are stored as literal text', () => {
  const app = service();
  app.post({ ...valid, name: '=HYPERLINK("https://example.com")', affiliation: '+SUM(1,2)' });
  assert.equal(app.rows[0][2].startsWith("'="), true);
  assert.equal(app.rows[0][3].startsWith("'+"), true);
});

test('missing configuration, storage errors, and lock failures report failure', () => {
  for (const options of [{ unconfigured: true }, { failWrite: true }, { busy: true }]) {
    const app = service(options);
    assert.equal(app.post(valid).ok, false);
    assert.equal(app.rows.length, 0);
    assert.equal(app.held(), false);
  }
});
