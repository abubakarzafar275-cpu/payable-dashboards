/**
 * ============================================================
 *  IMARAT GROUP — PayableDesk Google Sheets Bridge
 *  ============================================================
 *  HOW TO USE:
 *  1. Open your Google Sheet
 *  2. Click Extensions → Apps Script
 *  3. Delete all existing code and paste THIS entire file
 *  4. Click Deploy → New Deployment → Web App
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Click Deploy → Copy the Web App URL
 *  6. Paste that URL into the PayableDesk app Settings
 *
 *  YOUR GOOGLE SHEET MUST HAVE THESE 4 TABS (exact names):
 *  ─────────────────────────────────────────────────────────
 *  Tab 1:  PO_Report
 *  Tab 2:  Daily_Log
 *  Tab 3:  NonPO_Queue
 *  Tab 4:  COA_Accounts
 *  ============================================================
 */

// Maps dashboard data keys to Google Sheet tab names
const SHEET_TABS = {
  purchaseOrders : 'PO_Report',
  dailyLog       : 'Daily_Log',
  nonPoQueue     : 'NonPO_Queue',
  coaAccounts    : 'COA_Accounts'
};

/**
 * Main entry point — called when the dashboard fetches data.
 * Supports both plain JSON and JSONP (for local file:// usage).
 */
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = {};

  for (const [key, tabName] of Object.entries(SHEET_TABS)) {
    const sheet = ss.getSheetByName(tabName);
    if (!sheet) { result[key] = []; continue; }

    const values = sheet.getDataRange().getValues();
    if (values.length < 2) { result[key] = []; continue; }

    const headers = values[0].map(h => String(h).trim());

    result[key] = values.slice(1)
      .filter(row => row.some(cell => cell !== '' && cell !== null && cell !== undefined))
      .map(row => {
        const obj = {};
        headers.forEach((header, i) => {
          let val = row[i];
          // Convert Google Sheets Date objects to YYYY-MM-DD strings
          if (val instanceof Date) {
            val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
          }
          obj[header] = (val !== null && val !== undefined) ? String(val) : '';
        });
        return obj;
      });
  }

  const json = JSON.stringify(result);

  // JSONP support (needed for local file:// access)
  const callback = (e && e.parameter) ? e.parameter.callback : null;
  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${json})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  // Standard JSON response
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Optional: Write a single invoice row back to the Daily_Log sheet.
 * Called from the dashboard when a new invoice is logged.
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (!payload.type || !payload.data) throw new Error('Invalid payload');

    const tabName = SHEET_TABS[payload.type];
    if (!tabName) throw new Error('Unknown data type: ' + payload.type);

    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(tabName);
    if (!sheet) throw new Error('Tab not found: ' + tabName);

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row     = headers.map(h => payload.data[h] || '');

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
