/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CANNED RESPONSES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * User-specific saved response templates.
 * Original logic preserved exactly.
 */

const SHEET_NAME = "Responses";
var ResponseSheet = SpreadsheetApp.openById('1UbklwE_AseDLOShCLXfJPNL69E6Hxm20z9ajfAckNlU');

function getUserEmail() {
  return Session.getActiveUser().getEmail();
}

function getCannedResponses() {
  const email = getUserEmail();
  const sheet = ResponseSheet.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  return data
    .filter(row => row[3] === email)
    .map(row => ({ name: row[1], response: row[2], id: row[0] }));
}

function saveCannedResponse(name, response) {
  const email = getUserEmail();
  const sheet = ResponseSheet.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === name && data[i][3] === email) {
      sheet.getRange(i + 1, 3).setValue(response);
      sheet.getRange(i + 1, 5).setValue(now);
      return "Updated";
    }
  }
  
  const id = new Date().getTime();
  sheet.appendRow([id, name, response, email, now]);
  return "Saved";
}

