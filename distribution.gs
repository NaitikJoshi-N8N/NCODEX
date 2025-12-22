/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CASE DISTRIBUTION ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Dynamic, expiry-aware queue system for fair case distribution.
 * 
 * Key Features:
 * - Cases served by nearest expiry (due date)
 * - Balanced distribution across case types
 * - Auto-rebalance when analysts go inactive
 * - No permanent assignment — queue is source of truth
 */

// Session tracking stored in Script Properties
const SESSION_PROPERTY_KEY = "ANALYST_SESSIONS";
const ANALYST_STATUS_KEY = "ANALYST_STATUS";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SESSION MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Record analyst heartbeat to track activity
 * Called every 60 seconds from client
 */
function recordHeartbeat() {
  if (!FEATURES.ENABLE_CASE_DISTRIBUTION) return;
  
  const email = Session.getActiveUser().getEmail();
  if (!users.includes(email)) return;
  
  const props = PropertiesService.getScriptProperties();
  let sessions = {};
  
  try {
    const stored = props.getProperty(SESSION_PROPERTY_KEY);
    if (stored) sessions = JSON.parse(stored);
  } catch (e) {
    sessions = {};
  }
  
  sessions[email] = {
    lastHeartbeat: Date.now(),
    active: true
  };
  
  props.setProperty(SESSION_PROPERTY_KEY, JSON.stringify(sessions));
  
  return { status: "ok", timestamp: Date.now() };
}

/**
 * Get list of currently active analysts
 * Active = heartbeat within last 5 minutes
 * @returns {Array} - Array of active analyst emails
 */
function getActiveAnalysts() {
  const props = PropertiesService.getScriptProperties();
  let sessions = {};
  
  try {
    const stored = props.getProperty(SESSION_PROPERTY_KEY);
    if (stored) sessions = JSON.parse(stored);
  } catch (e) {
    return [];
  }
  
  const cutoff = Date.now() - DISTRIBUTION_CONFIG.SESSION_TIMEOUT_MS;
  const activeAnalysts = [];
  
  // Also check analyst status (enabled/disabled)
  let analystStatus = {};
  try {
    const statusStored = props.getProperty(ANALYST_STATUS_KEY);
    if (statusStored) analystStatus = JSON.parse(statusStored);
  } catch (e) {
    analystStatus = {};
  }
  
  for (const email of users) {
    const session = sessions[email];
    const status = analystStatus[email];
    
    // Skip disabled analysts
    if (status && status.disabled) continue;
    
    // Check if recently active
    if (session && session.lastHeartbeat > cutoff) {
      activeAnalysts.push(email);
    }
  }
  
  return activeAnalysts;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CASE QUEUE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Get all pending cases sorted by due date (nearest first)
 * @returns {Array} - Array of case objects with row, dueDate, disputeType, category
 */
function getPendingCaseQueue() {
  const lastRow = ss.getLastRow();
  if (lastRow < 2) return [];
  
  // Batch read all relevant columns
  const data = ss.getRange(2, 1, lastRow - 1, 35).getValues();
  
  const pendingCases = [];
  
  for (let i = 0; i < data.length; i++) {
    const rcaStatus = data[i][16]; // Column 17 (0-indexed: 16)
    const analystEmail = data[i][17]; // Column 18
    const resolveDate = data[i][18]; // Column 19
    const dueDate = data[i][5]; // Column 6
    const disputeType = data[i][12]; // Column 13
    
    // Case is pending if: no RCA or "Pending", no analyst assigned, not resolved
    const isPending = (!rcaStatus || rcaStatus === "Pending") && 
                      !analystEmail && 
                      !resolveDate;
    
    if (isPending && dueDate) {
      pendingCases.push({
        row: i + 2,
        caseId: data[i][0],
        itn: data[i][1],
        dueDate: new Date(dueDate),
        disputeType: disputeType,
        category: categorizeDisputeType(disputeType),
        portal: data[i][32]
      });
    }
  }
  
  // Sort by due date (nearest first)
  pendingCases.sort((a, b) => a.dueDate - b.dueDate);
  
  return pendingCases;
}

/**
 * Get case counts by category for a specific analyst
 * @param {string} analystEmail - Analyst email
 * @returns {Object} - Counts by category
 */
function getAnalystCaseCounts(analystEmail) {
  const lastRow = ss.getLastRow();
  if (lastRow < 2) return { FRAUD: 0, SERVICE: 0, CUSTOMER: 0, HOTEL: 0, UNKNOWN: 0, total: 0 };
  
  const data = ss.getRange(2, 1, lastRow - 1, 35).getValues();
  
  const counts = { FRAUD: 0, SERVICE: 0, CUSTOMER: 0, HOTEL: 0, UNKNOWN: 0, total: 0 };
  
  for (let i = 0; i < data.length; i++) {
    const analyst = data[i][17]; // Column 18
    const rcaStatus = data[i][16]; // Column 17
    const resolveDate = data[i][18]; // Column 19
    const disputeType = data[i][12]; // Column 13
    
    // Count cases assigned to analyst that are still pending
    if (analyst === analystEmail && (!resolveDate) && rcaStatus === "Pending") {
      const category = categorizeDisputeType(disputeType);
      counts[category]++;
      counts.total++;
    }
  }
  
  return counts;
}

/**
 * Get all analyst case counts for distribution summary
 * @returns {Object} - Map of analyst email to counts
 */
function getAllAnalystCaseCounts() {
  const lastRow = ss.getLastRow();
  if (lastRow < 2) return {};
  
  const data = ss.getRange(2, 1, lastRow - 1, 35).getValues();
  
  const allCounts = {};
  
  // Initialize all users
  for (const email of users) {
    allCounts[email] = { FRAUD: 0, SERVICE: 0, CUSTOMER: 0, HOTEL: 0, UNKNOWN: 0, total: 0 };
  }
  
  for (let i = 0; i < data.length; i++) {
    const analyst = data[i][17]; // Column 18
    const rcaStatus = data[i][16]; // Column 17
    const resolveDate = data[i][18]; // Column 19
    const disputeType = data[i][12]; // Column 13
    
    if (analyst && allCounts[analyst] && (!resolveDate) && rcaStatus === "Pending") {
      const category = categorizeDisputeType(disputeType);
      allCounts[analyst][category]++;
      allCounts[analyst].total++;
    }
  }
  
  return allCounts;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DISTRIBUTION ALGORITHM
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Get the next case for an analyst based on fair distribution
 * Algorithm:
 * 1. Get analyst's current type counts
 * 2. Calculate target distribution across active analysts
 * 3. Find category where analyst is below target
 * 4. Return oldest case of that category
 * 5. If balanced, return absolute oldest case
 * 
 * @param {string} portal - Optional portal filter
 * @returns {number} - Row number of next case, or 0 if none available
 */
function getNextDistributedCase(portal) {
  if (!FEATURES.ENABLE_CASE_DISTRIBUTION) {
    // Fallback to original logic
    return NotClaimedCasesV4();
  }
  
  const user = Session.getActiveUser().getEmail();
  if (!users.includes(user)) return 0;
  
  // Record activity
  recordHeartbeat();
  
  const pendingQueue = getPendingCaseQueue();
  if (pendingQueue.length === 0) return 0;
  
  // Filter by portal if specified
  let filteredQueue = pendingQueue;
  if (portal && portal !== "" && portal !== "Priority") {
    filteredQueue = pendingQueue.filter(c => c.portal === portal);
    if (filteredQueue.length === 0) return 0;
  }
  
  // Get active analysts and calculate targets
  const activeAnalysts = getActiveAnalysts();
  if (activeAnalysts.length === 0) {
    // No active analysts tracked yet, use all authorized users
    // This handles cold start
  }
  
  const analystCounts = getAnalystCaseCounts(user);
  
  // Calculate queue totals by category
  const queueTotals = { FRAUD: 0, SERVICE: 0, CUSTOMER: 0, HOTEL: 0, UNKNOWN: 0 };
  for (const c of filteredQueue) {
    queueTotals[c.category]++;
  }
  
  // Calculate what analyst should take based on balance
  const activeCount = Math.max(activeAnalysts.length, 1);
  const targets = {};
  for (const cat of ["FRAUD", "SERVICE", "CUSTOMER", "HOTEL"]) {
    targets[cat] = Math.ceil(queueTotals[cat] / activeCount);
  }
  
  // Find category where analyst is most below target
  let bestCategory = null;
  let maxDeficit = -Infinity;
  
  for (const cat of ["FRAUD", "SERVICE", "CUSTOMER", "HOTEL"]) {
    const deficit = targets[cat] - analystCounts[cat];
    if (deficit > maxDeficit && queueTotals[cat] > 0) {
      maxDeficit = deficit;
      bestCategory = cat;
    }
  }
  
  // Find oldest case in best category, or just oldest overall
  if (bestCategory) {
    const categoryCase = filteredQueue.find(c => c.category === bestCategory);
    if (categoryCase) return categoryCase.row;
  }
  
  // Fallback: return oldest case
  return filteredQueue[0].row;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADMIN FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Get full admin dashboard data
 * @returns {Object} - Complete dashboard data
 */
function getAdminDashboardData() {
  if (!FEATURES.ENABLE_ADMIN_PANEL) return { error: "Admin panel disabled" };
  if (!isCurrentUserAdmin()) return { error: "Access denied" };
  
  const props = PropertiesService.getScriptProperties();
  
  // Get sessions
  let sessions = {};
  try {
    const stored = props.getProperty(SESSION_PROPERTY_KEY);
    if (stored) sessions = JSON.parse(stored);
  } catch (e) {
    sessions = {};
  }
  
  // Get analyst status
  let analystStatus = {};
  try {
    const statusStored = props.getProperty(ANALYST_STATUS_KEY);
    if (statusStored) analystStatus = JSON.parse(statusStored);
  } catch (e) {
    analystStatus = {};
  }
  
  // Get case counts
  const allCounts = getAllAnalystCaseCounts();
  
  // Get queue stats
  const pendingQueue = getPendingCaseQueue();
  const queueByCategory = { FRAUD: 0, SERVICE: 0, CUSTOMER: 0, HOTEL: 0, UNKNOWN: 0 };
  for (const c of pendingQueue) {
    queueByCategory[c.category]++;
  }
  
  // Build analyst list
  const cutoff = Date.now() - DISTRIBUTION_CONFIG.SESSION_TIMEOUT_MS;
  const analysts = users.map(email => {
    const session = sessions[email] || {};
    const status = analystStatus[email] || {};
    const counts = allCounts[email] || { total: 0 };
    
    let activityStatus = "offline";
    if (status.disabled) {
      activityStatus = "disabled";
    } else if (session.lastHeartbeat && session.lastHeartbeat > cutoff) {
      activityStatus = "active";
    } else if (session.lastHeartbeat) {
      activityStatus = "idle";
    }
    
    return {
      email: email,
      status: activityStatus,
      disabled: !!status.disabled,
      casesAssigned: counts.total,
      casesByType: counts,
      lastSeen: session.lastHeartbeat ? new Date(session.lastHeartbeat).toISOString() : null
    };
  });
  
  return {
    analysts: analysts,
    queueStats: {
      total: pendingQueue.length,
      byCategory: queueByCategory
    },
    activeAnalystCount: getActiveAnalysts().length,
    timestamp: new Date().toISOString()
  };
}

/**
 * Enable or disable an analyst
 * @param {string} email - Analyst email
 * @param {boolean} disabled - Whether to disable
 * @returns {Object} - Result
 */
function setAnalystStatus(email, disabled) {
  if (!FEATURES.ENABLE_ADMIN_PANEL) return { error: "Admin panel disabled" };
  if (!isCurrentUserAdmin()) return { error: "Access denied" };
  if (!users.includes(email)) return { error: "Invalid analyst email" };
  
  const props = PropertiesService.getScriptProperties();
  
  let analystStatus = {};
  try {
    const stored = props.getProperty(ANALYST_STATUS_KEY);
    if (stored) analystStatus = JSON.parse(stored);
  } catch (e) {
    analystStatus = {};
  }
  
  analystStatus[email] = { disabled: disabled, updatedAt: Date.now() };
  props.setProperty(ANALYST_STATUS_KEY, JSON.stringify(analystStatus));
  
  return { success: true, email: email, disabled: disabled };
}

/**
 * Manually assign a case to an analyst (admin only)
 * @param {number} row - Case row number
 * @param {string} analystEmail - Target analyst email
 * @returns {Object} - Result
 */
function adminAssignCase(row, analystEmail) {
  if (!FEATURES.ENABLE_ADMIN_PANEL) return { error: "Admin panel disabled" };
  if (!isCurrentUserAdmin()) return { error: "Access denied" };
  if (!users.includes(analystEmail)) return { error: "Invalid analyst email" };
  
  const adminEmail = Session.getActiveUser().getEmail();
  
  // Assign the case
  ss.getRange(row, 18).setValue(analystEmail);
  ss.getRange(row, 17).setValue("Pending");
  ss.getRange(row, 32).setValue(new Date());
  
  // Log audit trail
  if (FEATURES.ENABLE_AUDIT_TRAIL) {
    logAuditEvent(row, "ADMIN_ASSIGN", adminEmail, { assignedTo: analystEmail });
  }
  
  return { success: true, row: row, assignedTo: analystEmail };
}

/**
 * Unassign a case (return to queue)
 * @param {number} row - Case row number
 * @returns {Object} - Result
 */
function adminUnassignCase(row) {
  if (!FEATURES.ENABLE_ADMIN_PANEL) return { error: "Admin panel disabled" };
  if (!isCurrentUserAdmin()) return { error: "Access denied" };
  
  const adminEmail = Session.getActiveUser().getEmail();
  const previousAnalyst = ss.getRange(row, 18).getValue();
  
  // Clear assignment
  ss.getRange(row, 18).clearContent();
  ss.getRange(row, 17).clearContent();
  ss.getRange(row, 32).clearContent();
  
  // Log audit trail
  if (FEATURES.ENABLE_AUDIT_TRAIL) {
    logAuditEvent(row, "ADMIN_UNASSIGN", adminEmail, { previousAnalyst: previousAnalyst });
  }
  
  return { success: true, row: row };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUDIT TRAIL
 * ═══════════════════════════════════════════════════════════════════════════
 */

const AUDIT_PROPERTY_KEY = "AUDIT_LOG";
const MAX_AUDIT_ENTRIES = 1000;

/**
 * Log an audit event
 * @param {number} caseRow - Case row number
 * @param {string} action - Action type
 * @param {string} userEmail - User who performed action
 * @param {Object} details - Additional details
 */
function logAuditEvent(caseRow, action, userEmail, details) {
  if (!FEATURES.ENABLE_AUDIT_TRAIL) return;
  
  const props = PropertiesService.getScriptProperties();
  
  let auditLog = [];
  try {
    const stored = props.getProperty(AUDIT_PROPERTY_KEY);
    if (stored) auditLog = JSON.parse(stored);
  } catch (e) {
    auditLog = [];
  }
  
  // Get case identifier
  let caseId = "";
  let itn = "";
  try {
    caseId = ss.getRange(caseRow, 1).getValue();
    itn = ss.getRange(caseRow, 2).getValue();
  } catch (e) {}
  
  auditLog.push({
    timestamp: new Date().toISOString(),
    caseRow: caseRow,
    caseId: caseId,
    itn: itn,
    action: action,
    user: userEmail,
    details: details
  });
  
  // Keep only last N entries
  if (auditLog.length > MAX_AUDIT_ENTRIES) {
    auditLog = auditLog.slice(-MAX_AUDIT_ENTRIES);
  }
  
  props.setProperty(AUDIT_PROPERTY_KEY, JSON.stringify(auditLog));
}

/**
 * Get audit log for a specific case
 * @param {number} caseRow - Case row number
 * @returns {Array} - Audit entries for case
 */
function getCaseAuditLog(caseRow) {
  if (!FEATURES.ENABLE_AUDIT_TRAIL) return [];
  
  const props = PropertiesService.getScriptProperties();
  
  let auditLog = [];
  try {
    const stored = props.getProperty(AUDIT_PROPERTY_KEY);
    if (stored) auditLog = JSON.parse(stored);
  } catch (e) {
    return [];
  }
  
  return auditLog.filter(entry => entry.caseRow === caseRow);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REALTIME DASHBOARD STATS
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Get realtime queue statistics
 * @returns {Object} - Queue stats
 */
function getRealtimeQueueStats() {
  const user = Session.getActiveUser().getEmail();
  if (!users.includes(user)) return { error: "Unauthorized" };
  
  const pendingQueue = getPendingCaseQueue();
  const userCounts = getAnalystCaseCounts(user);
  
  // Count by category
  const queueByCategory = { FRAUD: 0, SERVICE: 0, CUSTOMER: 0, HOTEL: 0, UNKNOWN: 0 };
  const queueByPortal = {};
  let urgentCount = 0; // Due within 2 days
  
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  
  for (const c of pendingQueue) {
    queueByCategory[c.category]++;
    queueByPortal[c.portal] = (queueByPortal[c.portal] || 0) + 1;
    if (c.dueDate <= twoDaysFromNow) urgentCount++;
  }
  
  return {
    totalPending: pendingQueue.length,
    byCategory: queueByCategory,
    byPortal: queueByPortal,
    urgent: urgentCount,
    myAssigned: userCounts.total,
    myByType: userCounts,
    activeAnalysts: getActiveAnalysts().length,
    timestamp: new Date().toISOString()
  };
}

