/**
 * Download registration endpoint for pratik-kothari.com.
 * Bind this script to a PRIVATE Google Sheet, run setupRegistrationSheet(),
 * and deploy as a web app. See docs/download-registration.md.
 */
var REGISTRATION_SHEET = 'Download registrations';
var REGISTRATION_HEADERS = ['Registered at', 'Email', 'Name', 'Institution / organization', 'Dataset requested', 'Email updates', 'Request ID'];

function setupRegistrationSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Open this script from Extensions > Apps Script in your private Google Sheet.');
  var sheet = spreadsheet.getSheetByName(REGISTRATION_SHEET) || spreadsheet.insertSheet(REGISTRATION_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(REGISTRATION_HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, REGISTRATION_HEADERS.length).setFontWeight('bold');
  }
  PropertiesService.getScriptProperties().setProperty('REGISTRATION_SPREADSHEET_ID', spreadsheet.getId());
}

function doGet() {
  // No public API exposes registrations or email addresses.
  return registrationResponse_({ ok: true, service: 'Download registration' });
}

function doPost(event) {
  var data = (event && event.parameter) || {};
  var email = String(data.email || '').trim();
  var name = String(data.name || '').trim();
  var affiliation = String(data.affiliation || '').trim();
  var dataset = String(data.dataset || '');
  var updates = String(data.updates || '');
  var requestId = String(data.request_id || '');
  var allowedDatasets = { 'tax-effectiveness': 'Tax Effectiveness Scores' };

  if (data.website || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      name.length > 120 || affiliation.length > 200 ||
      !Object.prototype.hasOwnProperty.call(allowedDatasets, dataset) ||
      ['yes', 'no'].indexOf(updates) === -1 ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) {
    return registrationResponse_({ ok: false, error: 'invalid_submission' });
  }

  var spreadsheetId = PropertiesService.getScriptProperties().getProperty('REGISTRATION_SPREADSHEET_ID');
  if (!spreadsheetId) return registrationResponse_({ ok: false, error: 'not_configured' });
  var lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(10000)) return registrationResponse_({ ok: false, error: 'busy' });
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(REGISTRATION_SHEET);
    if (!sheet) throw new Error('Registration sheet missing');
    var row = [new Date(), safeCell_(email), safeCell_(name), safeCell_(affiliation), allowedDatasets[dataset], updates === 'yes' ? 'Yes' : 'No', requestId];

    // Idempotent retries: a connection failure after the append must not create
    // an extra row. Check the persisted ID while holding the script lock.
    if (sheet.getLastRow() > 1) {
      var existing = sheet.getRange(2, 7, sheet.getLastRow() - 1, 1)
        .createTextFinder(requestId).matchEntireCell(true).findNext();
      if (existing) return registrationResponse_({ ok: true, requestId: requestId });
    }
    sheet.appendRow(row);
    SpreadsheetApp.flush();
    return registrationResponse_({ ok: true, requestId: requestId });
  } catch (error) {
    // Do not log or echo identifying details in the public response.
    return registrationResponse_({ ok: false, error: 'save_failed' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function safeCell_(value) {
  // Treat user-entered formulas as literal text, including after CSV export.
  return /^[=+\-@\t\r\n]/.test(value) ? "'" + value : value;
}

function registrationResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
