/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CASE MANAGEMENT — Core Logic (UNCHANGED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file contains the original core logic for case management.
 * All original functions are preserved exactly as they were.
 * Distribution logic is wrapped without modifying behavior.
 */

// ═══════════════════════════════════════════════════════════════════════════
// SHEET REFERENCES (IMMUTABLE)
// ═══════════════════════════════════════════════════════════════════════════

var ss = SpreadsheetApp.openById("1LxZiB_TTCxLMa-xwHhOsC4C1D-jneBQAE2wF8f_YEQ4").getSheetByName("database"); //rca sheet
var dashboard = SpreadsheetApp.openById("1LxZiB_TTCxLMa-xwHhOsC4C1D-jneBQAE2wF8f_YEQ4").getSheetByName("Dashboard"); //rca sheet
var controllerSheet = SpreadsheetApp.openById("1P4MLBYGsco4Wh1TnmnZjaxjNG7GBeZRXeIKf8oF36UQ").getSheetByName("datasheet");
var tempSheet = SpreadsheetApp.openById("1P4MLBYGsco4Wh1TnmnZjaxjNG7GBeZRXeIKf8oF36UQ").getSheetByName("Temp");
var recoverySheet = SpreadsheetApp.openById("1Gj6LfsQNfFHhFGDfIQ9X63yHjqVLma-luFfvl9Ju4h8").getSheetByName("data");
var vbExceptionSheet = SpreadsheetApp.openById("1ib7kcguVEXFoACNhZUxf-VDFbT-DlP74R9WO9l7FFnk").getSheetByName("data");
var emConfirmationSheet = SpreadsheetApp.openById('1FqABBeWj9L8F4z_RE5DGAdOFoUMp8F6Aq1i_uj3Yy7w');

var lastrow_recovery = recoverySheet.getLastRow();
var lastrow_controller = controllerSheet.getLastRow();
var Lastrow = ss.getLastRow();

// ═══════════════════════════════════════════════════════════════════════════
// AUTHORIZED USERS (IMMUTABLE)
// ═══════════════════════════════════════════════════════════════════════════

var users = [
  "jeevan.bist@priceline.com",
  "arun.choubey@priceline.com",
  "anusha.shetty@priceline.com",
  "nitingopal.singh@priceline.com",
  "deb.mukherjee@priceline.com",
  "tapas.sharma@priceline.com",
  "avdhut.bidwe@priceline.com",
  "priyanka.thakkar@priceline.com",
  "viren.joshi@priceline.com",
  "shwetank.mishra@priceline.com",
  "zankhana.yagnik@priceline.com",
  "sandeep.agrawal@priceline.com",
  "zankhit.mehta@priceline.com",
  "krutika.patel@priceline.com",
  "jayesh.parmar@priceline.com",
  "priyanka.ratudi@priceline.com",
  "tirth.soni@priceline.com",
  "sanyam.sisodiya@priceline.com",
  "bharati.dash@priceline.com",
  "harshil.girnari@priceline.com",
  "kunal.jadaun@priceline.com",
  "mrunal.patel@priceline.com",
  "aniket.jha@priceline.com",
  "anagha.s@priceline.com",
  "easwaran.m@priceline.com",
  "anjali.raj@priceline.com"
];

// ═══════════════════════════════════════════════════════════════════════════
// CORE CASE FINDING FUNCTIONS (ORIGINAL LOGIC — UNCHANGED)
// ═══════════════════════════════════════════════════════════════════════════

function NotClaimedCasesV4() {
  var user = Session.getActiveUser().getEmail();
  var rowAssigned = users.indexOf(user) + 7;
  var tempCell = dashboard.getRange("AC" + rowAssigned.toString());
  var row = 0;
  
  var filterFormula = `=Index(FILTER(ROW(database!Q:Q),(ISBLANK(database!Q:Q))+(database!Q:Q="Pending"), (ISBLANK(database!R:R))+(database!R:R="${user}"),(ISBLANK(database!S:S))),1)`;
  
  tempCell.setFormula(filterFormula);
  var result = tempCell.getValue();
  tempCell.clearContent();
  
  if (result <= Lastrow && result != "#N/A") {
    row = result;
  }
  return row;
}

function NotClaimedCasesV2(currency, portal) {
  var user = Session.getActiveUser().getEmail();
  var valuesAnalyst = ss.getRange(2, 18, Lastrow).getValues();
  var valuesResolveDate = ss.getRange(2, 19, Lastrow).getValues();
  var valuesCurrency = ss.getRange(2, 12, Lastrow).getValues();
  var valuesPortal = ss.getRange(2, 33, Lastrow).getValues();
  var valuesRCA = ss.getRange(2, 17, Lastrow).getValues();
  
  if (currency == "Non USD") {
    for (i = 0; i < valuesAnalyst.length; i++) {
      if ((valuesAnalyst[i][0] == "" || valuesAnalyst[i][0] == user) && 
          (valuesRCA[i][0] == "Pending" || valuesRCA[i][0] == "") && 
          (valuesCurrency[i][0] != "USD") && 
          (valuesPortal[i][0] == portal) && 
          (valuesResolveDate[i][0] == "")) {
        return i + 2;
        break;
      }
    }
  } else {
    for (i = 0; i < valuesAnalyst.length; i++) {
      if ((valuesAnalyst[i][0] == "" || valuesAnalyst[i][0] == user) && 
          (valuesRCA[i][0] == "Pending" || valuesRCA[i][0] == "") && 
          (valuesCurrency[i][0] == "USD") && 
          (valuesPortal[i][0] == portal) && 
          (valuesResolveDate[i][0] == "")) {
        return i + 2;
        break;
      }
    }
  }
  
  if (i = valuesAnalyst.length) {
    return 0;
  }
}

function NotClaimedPriority() {
  var user = Session.getActiveUser().getEmail();
  var valuesAnalyst = ss.getRange(2, 18, Lastrow).getValues();
  var valuesResolveDate = ss.getRange(2, 19, Lastrow).getValues();
  var valuesCurrency = ss.getRange(2, 12, Lastrow).getValues();
  var valuesPortal = ss.getRange(2, 33, Lastrow).getValues();
  var valuesRCA = ss.getRange(2, 17, Lastrow).getValues();
  var valuesQueue = ss.getRange(2, 34, Lastrow).getValues();
  
  var days = [0, 1, 2, 3, 4, 5, 6];
  var row = 0;
  
  for (j = 0; j < days.length; j++) {
    for (i = 0; i < valuesQueue.length; i++) {
      if ((valuesQueue[i][0] == days[j]) && 
          (valuesAnalyst[i][0] == "" || valuesAnalyst[i][0] == user) && 
          (valuesRCA[i][0] == "Pending" || valuesRCA[i][0] == "")) {
        row = i;
        break;
      }
    }
    if (row > 0) {
      break;
    }
  }
  
  return row + 2;
}

// ═══════════════════════════════════════════════════════════════════════════
// CLAIM CASE (ORIGINAL LOGIC — UNCHANGED)
// ═══════════════════════════════════════════════════════════════════════════

function ClaimCase(row) {
  var user = Session.getActiveUser().getEmail();
  ss.getRange(row, 18).setValue(user);
  ss.getRange(row, 17).setValue("Pending");
  ss.getRange(row, 32).setValue(new Date());
  
  // Log audit event if feature enabled
  if (typeof FEATURES !== 'undefined' && FEATURES.ENABLE_AUDIT_TRAIL) {
    logAuditEvent(row, "CLAIM", user, {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GET CASE — With Distribution Integration
// ═══════════════════════════════════════════════════════════════════════════

function getCase(portal) {
  var data = new Array();
  var row = 0;
  
  if (portal == "Priority") {
    row = NotClaimedPriority();
  } else {
    // Use distribution engine if enabled, otherwise use original logic
    if (typeof FEATURES !== 'undefined' && FEATURES.ENABLE_CASE_DISTRIBUTION) {
      row = getNextDistributedCase(portal);
    } else {
      row = NotClaimedCasesV4();
    }
  }
  
  if (users.includes(Session.getActiveUser().getEmail())) {
    if (row > 0) {
      ClaimCase(row);
      data.push("Case claimed.");
      data.push(row);
      data.push(ss.getRange(row, 1).getValue()); // caseid
      data.push(ss.getRange(row, 2).getValue()); // itn
      data.push(ss.getRange(row, 9).getValue()); // R#
      data.push(ss.getRange(row, 4).getValue()); // rCode
      data.push(ss.getRange(row, 7).getValue()); // dAmt
      data.push(ss.getRange(row, 13).getValue()); // dispute type   
      data.push(ss.getRange(row, 27).getValue()); // refund
      data.push(ss.getRange(row, 10).getValue()); // tAmt
      data.push(ss.getRange(row, 12).getValue()); // currency   
      data.push(Utilities.formatDate(ss.getRange(row, 5).getValue(), "IST", "MM/dd/yyyy")); // rDate
      data.push(Utilities.formatDate(ss.getRange(row, 6).getValue(), "IST", "MM/dd/yyyy")); // dDue
      data.push(ss.getRange(row, 33).getValue()); // portal
      data.push(ss.getRange(row, 29).getValue()); // policy
      data.push(ss.getRange(row, 22).getValue()); // internal notes
      data.push(ss.getRange(row, 35).getValue()); // affirm link
    } else {
      data.push("No Cases", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "");
      data.push(0);
    }
  } else {
    data.push("You are not Authorized", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "");
    data.push(0);
  }
  
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH CASE (ORIGINAL LOGIC — UNCHANGED)
// ═══════════════════════════════════════════════════════════════════════════

function searchCase(itn) {
  var user = Session.getActiveUser().getEmail();
  var ITNs = ss.getRange(2, 2, Lastrow).getValues();
  var RCAanalysts = ss.getRange(2, 18, Lastrow).getValues();
  var row = 0;
  
  for (i = 0; i < ITNs.length; i++) {
    if (ITNs[i][0] == itn && RCAanalysts[i][0] == user) {
      row = i + 2;
      break;
    }
  }
  
  var data = new Array();
  if (row != 0) {
    data.push("Case retrieved.");
    data.push(row);
    data.push(ss.getRange(row, 1).getValue()); // caseid
    data.push(ss.getRange(row, 2).getValue()); // itn
    data.push(ss.getRange(row, 9).getValue()); // R#
    data.push(ss.getRange(row, 4).getValue()); // rCode
    data.push(ss.getRange(row, 7).getValue()); // dAmt
    data.push(ss.getRange(row, 13).getValue()); // dispute type   
    data.push(ss.getRange(row, 27).getValue()); // refund
    data.push(ss.getRange(row, 10).getValue()); // tAmt
    data.push(ss.getRange(row, 12).getValue()); // currency   
    data.push(Utilities.formatDate(ss.getRange(row, 5).getValue(), "IST", "MM/dd/yyyy")); // rDate
    data.push(Utilities.formatDate(ss.getRange(row, 6).getValue(), "IST", "MM/dd/yyyy")); // dDue
    data.push(ss.getRange(row, 33).getValue()); // portal
    data.push(ss.getRange(row, 29).getValue()); // policy
    data.push(ss.getRange(row, 20).getValue()); // issuer notes
    data.push(ss.getRange(row, 21).getValue()); // rebuttal
    data.push(ss.getRange(row, 22).getValue()); // internal notes
    data.push(ss.getRange(row, 35).getValue()); // affirm link
    data.push(ss.getRange(row, 17).getValue()); // rca
  } else {
    data.push("No Results", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "");
  }
  
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════
// GET RESERVATION DATA (ORIGINAL LOGIC — UNCHANGED)
// ═══════════════════════════════════════════════════════════════════════════

function getReservationData(itn) {
  const searchRange = 'datasheet!A:A';
  const searchValue = itn;
  const matchFormula = `=MATCH("${searchValue}", ${searchRange}, 0)`;
  
  var tempRowCell = users.indexOf(Session.getActiveUser().getEmail()) + 2;
  const tempCell = tempSheet.getRange('B' + tempRowCell.toString());
  tempCell.setFormula(matchFormula);
  const row = tempCell.getValue();
  tempCell.clearContent();
  
  var resinfo = new Array();
  resinfo.push("Reservation information fetched.");
  resinfo.push(row);
  resinfo.push(controllerSheet.getRange(row, 1).getValue()); // itn
  resinfo.push(Utilities.formatDate(controllerSheet.getRange(row, 4).getValue(), "CST", "MM/dd/yyyy")); // booking date
  resinfo.push(controllerSheet.getRange(row, 13).getValue()); // hotel
  resinfo.push("guest"); // guest
  resinfo.push(Utilities.formatDate(controllerSheet.getRange(row, 16).getValue(), "CST", "MM/dd/yyyy")); // check in
  resinfo.push(Utilities.formatDate(controllerSheet.getRange(row, 17).getValue(), "CST", "MM/dd/yyyy")); // checkout
  resinfo.push("test"); // email
  var rtype = controllerSheet.getRange(row, 18).getValue().trim() || "not available";
  resinfo.push(rtype); // rtype
  
  return resinfo;
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK CLAIM (ORIGINAL LOGIC — UNCHANGED)
// ═══════════════════════════════════════════════════════════════════════════

function checkClaim(row) {
  var user = Session.getActiveUser().getEmail();
  var claimed = ss.getRange(row, 18).getValue();
  
  if (user == claimed) {
    var response = ["Case currently claimed to " + claimed, "#2ea44f", "white"];
  } else {
    var response = ["Case currently claimed to " + claimed, "red", "white"];
  }
  
  return response;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESOLVE RCA — With Audit Trail Integration
// ═══════════════════════════════════════════════════════════════════════════

function resolveRCA(row, rca, res, issuernotes, internalnotes) {
  var user = Session.getActiveUser().getEmail();
  
  ss.getRange(row, 20).setValue(issuernotes);
  ss.getRange(row, 21).setValue(res);
  ss.getRange(row, 22).setValue(internalnotes);
  ss.getRange(row, 17).setValue(rca);
  ss.getRange(row, 19).setValue(new Date());
  ss.getRange(row, 24).clearContent();
  
  sendForEmailConfirmation(row);
  
  // Log audit event if feature enabled
  if (typeof FEATURES !== 'undefined' && FEATURES.ENABLE_AUDIT_TRAIL) {
    logAuditEvent(row, "RESOLVE", user, { rca: rca });
  }
  
  return "Case Updated.";
}

// ═══════════════════════════════════════════════════════════════════════════
// FRAUD CODES (IMMUTABLE)
// ═══════════════════════════════════════════════════════════════════════════

var Fraud = [
  "10.4", "37", 10.4, 37, "AA", 
  "Card Member does not recognise Transaction or Transaction Amount-6014", 
  "Card not present fraud-F29", 
  "Card not present-4540", 
  "Does Not Recognize/ Remember/ No Knowledge-127", 
  "Fraud-193", 
  "Fraudulent Transactions-193", 
  "No knowledge-127", 
  "U02", 
  "Fraud", 
  "Card Member claims fraud-6006", 
  "Does Not Recognize/ Remember/ No Knowledge-176", 
  1040, 
  "Fraud (No authorization)", 
  "Fraud (Card not present)", 
  "Not Recognized"
];

// ═══════════════════════════════════════════════════════════════════════════
// SEND FOR EMAIL CONFIRMATION (ORIGINAL LOGIC — UNCHANGED)
// ═══════════════════════════════════════════════════════════════════════════

function sendForEmailConfirmation(row) {
  var code = ss.getRange(row, 4).getValue();
  var interface = ss.getRange(row, 14).getValue();
  var tempSheetEmail = emConfirmationSheet.getSheetByName('temp');
  var mainSheet = emConfirmationSheet.getSheetByName('data');
  
  var creditnot = ["Credit Not Processed", 13.7, 1370, "13.7", "13.70", "1370"];
  
  if (Fraud.includes(code) || (creditnot.includes(code) && interface == "call_center")) {
    var itn = ss.getRange(row, 2).getValue();
    var tempCell = tempSheetEmail.getRange("B" + (Math.floor(Math.random() * 10)));
    tempCell.setFormula(`=COUNTIF(data!B:B,"${itn}")`);
    
    if (tempCell.getValue() == 0) {
      var lastrow_email = mainSheet.getLastRow();
      var user = Session.getActiveUser().getEmail();
      mainSheet.getRange(lastrow_email + 1, 1).setValue(user);
      mainSheet.getRange(lastrow_email + 1, 2).setValue(itn);
      var date = new Date();
      mainSheet.getRange(lastrow_email + 1, 3).setValue(Utilities.formatDate(date, "CST", "MM-dd-yyyy"));
      mainSheet.getRange(lastrow_email + 1, 4).setValue(ss.getRange(row, 6).getValue());
      mainSheet.getRange(lastrow_email + 1, 5).setValue("Pending");
    }
    tempCell.clearContent();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT COUNT (Queue Stats)
// ═══════════════════════════════════════════════════════════════════════════

function agentCount() {
  var user = Session.getActiveUser().getEmail();
  if (!users.includes(user)) return { error: "Unauthorized" };
  
  var data = ss.getRange(2, 1, Lastrow, 35).getValues();
  
  var counts = {
    myCount: 0,
    myFraud: 0,
    priority: 0,
    affirm: 0,
    amex: 0,
    braintree: 0,
    chase: 0
  };
  
  for (var i = 0; i < data.length; i++) {
    var analyst = data[i][17]; // Column 18 (0-indexed: 17)
    var rcaStatus = data[i][16]; // Column 17
    var resolveDate = data[i][18]; // Column 19
    var portal = data[i][32]; // Column 33
    var queue = data[i][33]; // Column 34
    var disputeType = data[i][12]; // Column 13
    
    // Only count pending cases
    if (rcaStatus === "Pending" && !resolveDate) {
      // Count user's cases
      if (analyst === user) {
        counts.myCount++;
        if (Fraud.includes(disputeType)) {
          counts.myFraud++;
        }
      }
      
      // Count by portal (unassigned cases)
      if (!analyst) {
        if (queue <= 3) counts.priority++;
        if (portal === "Affirm") counts.affirm++;
        if (portal === "Amex") counts.amex++;
        if (portal === "Braintree") counts.braintree++;
        if (portal === "Chase") counts.chase++;
      }
    }
  }
  
  return counts;
}

// ═══════════════════════════════════════════════════════════════════════════
// CREATE CANNED RESPONSE (Booking Data)
// ═══════════════════════════════════════════════════════════════════════════

function createCannedRes(row) {
  if (!row || row === "") return "";
  
  try {
    var itn = ss.getRange(row, 2).getValue();
    var bookingDate = ss.getRange(row, 5).getValue();
    var dueDate = ss.getRange(row, 6).getValue();
    var amount = ss.getRange(row, 7).getValue();
    var currency = ss.getRange(row, 12).getValue();
    
    var response = "Booking Details:\n";
    response += "ITN: " + itn + "\n";
    response += "Booking Date: " + Utilities.formatDate(bookingDate, "CST", "MM/dd/yyyy") + "\n";
    response += "Due Date: " + Utilities.formatDate(dueDate, "CST", "MM/dd/yyyy") + "\n";
    response += "Amount: " + amount + " " + currency + "\n";
    
    return response;
  } catch (e) {
    return "";
  }
}

