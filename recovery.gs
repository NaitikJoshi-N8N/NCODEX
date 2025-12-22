/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RECOVERY & PENDING CASES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Original logic preserved exactly.
 */

function sendForRecovery(itn, rnum, amt, cin, cout, hotel, cbcode, notes) {
  var new_row = lastrow_recovery + 1;
  recoverySheet.getRange(new_row, 1).setValue(new Date());
  recoverySheet.getRange(new_row, 2).setValue(Session.getActiveUser().getEmail().split("@")[0]);
  recoverySheet.getRange(new_row, 3).setValue(itn);
  recoverySheet.getRange(new_row, 4).setValue(rnum);
  recoverySheet.getRange(new_row, 5).setValue(amt);
  recoverySheet.getRange(new_row, 6).setValue(cin);
  recoverySheet.getRange(new_row, 7).setValue(cout);
  recoverySheet.getRange(new_row, 8).setValue(hotel);
  recoverySheet.getRange(new_row, 9).setValue(cbcode);
  recoverySheet.getRange(new_row, 10).setValue(notes);
  
  return "Case sent for recovery.";
}

var lastrow_vbException = vbExceptionSheet.getLastRow();

function sendForVbException(itn, rnum, amt, option, notes) {
  var new_row = lastrow_vbException + 1;
  vbExceptionSheet.getRange(new_row, 1).setValue(new Date());
  vbExceptionSheet.getRange(new_row, 2).setValue(Session.getActiveUser().getEmail().split("@")[0]);
  vbExceptionSheet.getRange(new_row, 3).setValue(itn);
  vbExceptionSheet.getRange(new_row, 4).setValue(rnum);
  vbExceptionSheet.getRange(new_row, 5).setValue(amt);
  vbExceptionSheet.getRange(new_row, 6).setValue(option);
  vbExceptionSheet.getRange(new_row, 7).setValue(notes);
  
  return "Exception logged.";
}

function updateRefundAmount(row, amount) {
  ss.getRange(row, 27).setValue(amount);
}

function updateRoomType(row, roomtype) {
  controllerSheet.getRange(row, 18).setValue(roomtype);
}

function getPendingCases() {
  var user = Session.getActiveUser().getEmail();
  var RCAnalysts = ss.getRange(2, 18, Lastrow).getValues();
  var RCAValues = ss.getRange(2, 17, Lastrow).getValues();
  var rows = new Array();
  
  for (i = 0; i < RCAnalysts.length; i++) {
    if (RCAValues[i][0] == "Pending" && (RCAnalysts[i][0] == user)) {
      rows.push(i + 2);
    }
  }
  
  var disputes = new Array();
  
  if (rows.length > 0) {
    for (row of rows) {
      var dispute = new Array();
      dispute.push(row);
      dispute.push(ss.getRange(row, 1).getValue()); // caseid
      dispute.push(ss.getRange(row, 2).getValue()); // itn
      dispute.push(ss.getRange(row, 4).getValue()); // reasoncode
      dispute.push(Utilities.formatDate(ss.getRange(row, 5).getValue(), "CST", "MM/dd/yyyy")); // received
      dispute.push(Utilities.formatDate(ss.getRange(row, 6).getValue(), "CST", "MM/dd/yyyy")); // duedate
      dispute.push(ss.getRange(row, 22).getValue()); // notes
      disputes.push(dispute);
    }
  }
  
  return disputes;
}

