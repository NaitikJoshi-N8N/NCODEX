/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WEB APP ENTRY POINT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Handles routing between main RCA Manager and Admin Panel.
 */

/**
 * Main entry point for the web app
 * @param {Object} request - The request object containing parameters
 * @returns {HtmlOutput} - The HTML page to render
 */
function doGet(request) {
  // Check if admin panel is requested
  var page = request.parameter.page || 'main';
  
  if (page === 'admin' && FEATURES.ENABLE_ADMIN_PANEL) {
    return HtmlService.createTemplateFromFile('AdminPanel')
      .evaluate()
      .setTitle('CBMS RCA Manager — Admin')
      .setFaviconUrl('https://drive.google.com/uc?id=1XOOwMdi1d6IVYlDV0A9grhfXbWGyRd7X&export=download&format=png')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  // Default: Main RCA page
  return HtmlService.createTemplateFromFile('MainRCAPage')
    .evaluate()
    .setTitle('CBMS RCA Manager')
    .setFaviconUrl('https://drive.google.com/uc?id=1XOOwMdi1d6IVYlDV0A9grhfXbWGyRd7X&export=download&format=png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Include HTML files (for templates, stylesheets, scripts)
 * @param {string} filename - Name of the file to include
 * @returns {string} - The file content
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Get the web app URL (for linking between pages)
 * @returns {string} - The base URL of the web app
 */
function getWebAppUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * Get admin panel URL
 * @returns {string} - URL to the admin panel
 */
function getAdminPanelUrl() {
  return ScriptApp.getService().getUrl() + '?page=admin';
}

