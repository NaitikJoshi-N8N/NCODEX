/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE UPLOADER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Handles image and PDF uploads to Google Drive.
 * Original logic preserved exactly.
 */

function uploadImageToDrive(row, itn, inputId, base64Data) {
  const folder = DriveApp.getFolderById('1XS3U6wpaPW3DVKEhEy9iPSjjJ91e71SM');
  
  if (inputId == "wex") {
    var fileName = itn + " - Hotel Billed GAR.png";
    var col = 20;
  } else if (inputId == "ais") {
    var fileName = itn + " - Accertify Index Score.png";
    var col = 21;
  } else if (inputId == "rfs") {
    var fileName = itn + " - Refund screenshot.png";
    var col = 22;
  } else if (inputId == "ccontact") {
    var fileName = itn + " - Customer contact.png";
    var col = 23;
  } else if (inputId == "nonfraud") {
    var fileName = itn + " - Non Fraud Info.png";
    var col = 24;
  } else if (inputId == "nonfraud1") {
    var fileName = itn + " - Non Fraud Info1.png";
    var col = 25;
  } else {
    var fileName = itn + " - Non Fraud Info2.png";
    var col = 26;
  }
  
  try {
    const decodedData = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedData, 'image/png', fileName);
    const uploadedFile = folder.createFile(blob);
    
    controllerSheet.getRange(row, col).setValue(uploadedFile.getId());
    
    return {
      inputId: inputId,
      status: 'Uploaded',
      name: uploadedFile.getName(),
      url: uploadedFile.getUrl()
    };
  } catch (error) {
    Logger.log('Upload Error: ' + error.toString());
    throw new Error('Failed to upload the image.');
  }
}

const FOLDER_IDS = {
  confirmpage: '1TgubfrYEmPVhphWoWqEs3llZu9fb4NaO',
  checkoutpage: '1DNJmU73y3hrqT2nIBnxN31FFvqUt9toG',
  confirmpages: '1TgubfrYEmPVhphWoWqEs3llZu9fb4NaO',
  checkoutpages: '1DNJmU73y3hrqT2nIBnxN31FFvqUt9toG',
  wexandrefund: '198moy73H6UE4sv3bI-l6gFy3N4CCrOUo',
  accproof: '1nKCj2b1ZiG53BwNTL-v5D0TS-5Oq4aVb'
};

function uploadAllFiles(formData) {
  const uploadedResults = [];
  
  function uploadSingle(file, folderId, label, fileName) {
    const blob = Utilities.newBlob(Utilities.base64Decode(file.content), file.mimeType, fileName);
    DriveApp.getFolderById(folderId).createFile(blob);
    uploadedResults.push(`${label}: ${fileName}`);
  }
  
  if (formData.confirmpage) {
    uploadSingle(formData.confirmpage, FOLDER_IDS.confirmpage, "Confirmation page", formData.itn + " - Reservation Confirmation.pdf");
  }
  
  if (formData.checkoutpage) {
    uploadSingle(formData.checkoutpage, FOLDER_IDS.checkoutpage, "Checkout page", formData.itn + " - Checkout Page.pdf");
  }
  
  if (formData.confirmpages) {
    uploadSingle(formData.confirmpages, FOLDER_IDS.confirmpages, "Confirmation pages", formData.itn + " - other reservations.pdf");
  }
  
  if (formData.checkoutpages) {
    uploadSingle(formData.checkoutpages, FOLDER_IDS.checkoutpages, "Checkout pages", formData.itn + " - other checkout pages.pdf");
  }
  
  if (formData.wexandrefund) {
    uploadSingle(formData.wexandrefund, FOLDER_IDS.wexandrefund, "Hotel billed/refund proofs", formData.itn + " - other hotel billed/refund proofs.pdf");
  }
  
  if (formData.accproof) {
    uploadSingle(formData.accproof, FOLDER_IDS.accproof, "Customer Proof", formData.itn + " - Customer Proof.pdf");
  }
  
  return { status: "success", message: "Files uploaded successfully!", uploaded: uploadedResults };
}

