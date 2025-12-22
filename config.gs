/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIGURATION — Feature Flags & System Settings
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Toggle features on/off without touching core logic.
 * All new functionality is isolated behind these flags.
 */

const FEATURES = {
  ENABLE_CASE_DISTRIBUTION: true,
  ENABLE_ADMIN_PANEL: true,
  ENABLE_KEYBOARD_SHORTCUTS: true,
  ENABLE_SLA_TRACKER: true,
  ENABLE_AUDIT_TRAIL: true,
  ENABLE_REALTIME_DASHBOARD: true
};

/**
 * Admin Configuration
 * Only these emails can access the Admin Panel
 */
const ADMIN_EMAILS = [
  "admin@adminpanel.com"
  // Add additional admin emails here
];

/**
 * Distribution Configuration
 */
const DISTRIBUTION_CONFIG = {
  // Session timeout in milliseconds (5 minutes)
  SESSION_TIMEOUT_MS: 5 * 60 * 1000,
  
  // Heartbeat interval in milliseconds (60 seconds)
  HEARTBEAT_INTERVAL_MS: 60 * 1000,
  
  // Maximum cases per analyst before overflow to others
  MAX_CASES_PER_ANALYST: 50,
  
  // Allowed variance in case type distribution (±1)
  TYPE_BALANCE_VARIANCE: 1
};

/**
 * Dispute Type Mapping
 * Maps dispute types (column 13) to distribution categories
 */
const DISPUTE_TYPE_CATEGORIES = {
  FRAUD: [
    "Fraud",
    "10.4",
    "37",
    "AA",
    "Card Member does not recognise Transaction",
    "Card not present fraud",
    "Card not present",
    "Does Not Recognize",
    "No knowledge",
    "Fraudulent",
    "U02",
    "Not Recognized"
  ],
  SERVICE: [
    "INQ",
    "Inquiry",
    "Cancel",
    "Cancellation",
    "Service"
  ],
  CUSTOMER: [
    "Customer",
    "Booking Error",
    "Currency",
    "Tax",
    "Duplicate"
  ],
  HOTEL: [
    "Hotel",
    "Room",
    "Unsatisfactory",
    "Billed Direct"
  ]
};

/**
 * Categorize a dispute type string into one of the four categories
 * @param {string} disputeType - The dispute type from column 13
 * @returns {string} - FRAUD, SERVICE, CUSTOMER, HOTEL, or UNKNOWN
 */
function categorizeDisputeType(disputeType) {
  if (!disputeType) return "UNKNOWN";
  
  const upperType = disputeType.toString().toUpperCase();
  
  for (const [category, keywords] of Object.entries(DISPUTE_TYPE_CATEGORIES)) {
    for (const keyword of keywords) {
      if (upperType.includes(keyword.toUpperCase())) {
        return category;
      }
    }
  }
  
  return "UNKNOWN";
}

/**
 * Check if current user is an admin
 * @returns {boolean}
 */
function isCurrentUserAdmin() {
  const email = Session.getActiveUser().getEmail();
  return ADMIN_EMAILS.includes(email);
}

/**
 * Check if current user is an authorized analyst
 * @returns {boolean}
 */
function isAuthorizedAnalyst() {
  const email = Session.getActiveUser().getEmail();
  return users.includes(email);
}

