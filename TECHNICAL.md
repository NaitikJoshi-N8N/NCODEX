  4444e# CBMS RCA Manager — Technical Documentation

<div align="center">

**Version 4.1.1** | **Google Apps Script** | **Internal Documentation**

</div>

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Data Layer](#2-data-layer)
3. [Server-Side Components](#3-server-side-components)
4. [Client-Side Components](#4-client-side-components)
5. [API Reference](#5-api-reference)
6. [Data Flow Diagrams](#6-data-flow-diagrams)
7. [Security Model](#7-security-model)
8. [Performance Considerations](#8-performance-considerations)
9. [Error Handling](#9-error-handling)
10. [Testing Guide](#10-testing-guide)
11. [Deployment](#11-deployment)
12. [Migration Guide](#12-migration-guide)
13. [Dependencies](#13-dependencies)
14. [Known Limitations](#14-known-limitations)
15. [Future Roadmap](#15-future-roadmap)

---

## 1. Architecture Overview

### System Architecture

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                         Web Browser                                     │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │  │
│  │  │MainRCAPage  │ │ AdminPanel  │ │ Stylesheet  │ │ JavaScript  │        │  │
│  │  │   .html     │ │   .html     │ │   .html     │ │   .html     │        │  │
│  │  └──────┬──────┘ └──────┬──────┘ └─────────────┘ └──────┬──────┘        │  │
│  │         │               │                               │               │  │
│  │         └───────────────┴───────────────────────────────┘               │  │
│  │                                   │                                     │  │
│  │                    google.script.run API                                │  │
│  └───────────────────────────────────┼─────────────────────────────────────┘  │
└──────────────────────────────────────┼────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────┼──────────────────────────────────────┐
│                              SERVER LAYER                                   │
│                                      │                                      │
│  ┌───────────────────────────────────┼───────────────────────────────────┐  │
│  │                    Google Apps Script Runtime                         │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │  │
│  │  │  config.gs  │ │distribution │ │casemanagement│ │  doget.gs  │      │  │
│  │  │             │ │    .gs      │ │    .gs      │ │             │      │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                      │  │
│  │  │ recovery.gs │ │ uploader.gs │ │cannedresp.gs│                      │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────┼──────────────────────────────────────┐
│                              DATA LAYER                                     │
│                                      │                                      │
│  ┌───────────────────────────────────┼───────────────────────────────────┐  │
│  │                         Google Workspace                              │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      Google Sheets                              │  │  │
│  │  │  • RCA Database (ss)           • Controller (controllerSheet)   │  │  │
│  │  │  • Dashboard                   • Recovery Sheet                 │  │  │
│  │  │  • VB Exception Sheet          • Email Confirmation Sheet       │  │  │
│  │  │  • Canned Responses Sheet                                       │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      Google Drive                               │  │  │
│  │  │  • Image Folders (WEX, Accertify, Refunds, etc.)                │  │  │
│  │  │  • PDF Folders (Confirmation, Checkout, etc.)                   │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                   Script Properties                             │  │  │
│  │  │  • Session Data (ANALYST_SESSIONS)                              │  │  │
│  │  │  • Analyst Status (ANALYST_STATUS)                              │  │  │
│  │  │  • Audit Log (AUDIT_LOG)                                        │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Design Patterns

| Pattern | Usage |
|---------|-------|
| **MVC-like** | Separation of HTML views, JS controllers, GS models |
| **Feature Flags** | Toggle functionality without code changes |
| **Singleton** | Sheet references initialized once at script load |
| **Observer** | Heartbeat system for session tracking |
| **Strategy** | Distribution algorithm selectable via config |

---

## 2. Data Layer

### Google Sheets Structure

#### Main RCA Database (`ss`)
**Spreadsheet ID**: `1LxZiB_TTCxLMa-xwHhOsC4C1D-jneBQAE2wF8f_YEQ4`
**Sheet Name**: `database`

| Column | Index | Field Name | Data Type | Description |
|--------|-------|------------|-----------|-------------|
| A | 1 | Case ID | String | Unique case identifier |
| B | 2 | ITN | String | Merchant Order Number |
| C | 3 | — | — | — |
| D | 4 | Reason Code | String | Chargeback reason code |
| E | 5 | Dispute Date | Date | When dispute was filed |
| F | 6 | Due Date | Date | Response deadline |
| G | 7 | Dispute Amount | Number | Amount in dispute |
| H | 8 | — | — | — |
| I | 9 | Reservation # | String | Hotel reservation number |
| J | 10 | Transaction Amount | Number | Original transaction amount |
| K | 11 | — | — | — |
| L | 12 | Currency | String | USD, EUR, etc. |
| M | 13 | Dispute Type | String | **Used for distribution** |
| N | 14 | Interface | String | call_center, online |
| O-P | 15-16 | — | — | — |
| Q | 17 | RCA Status | String | Pending, Resolved, etc. |
| R | 18 | Analyst Email | String | Assigned analyst |
| S | 19 | Resolve Date | Date | When case was resolved |
| T | 20 | Issuer Notes | Text | Notes from issuer |
| U | 21 | Rebuttal | Text | Response text |
| V | 22 | Internal Notes | Text | Internal team notes |
| W | 23 | — | — | — |
| X | 24 | — | — | Cleared on resolve |
| Y-Z | 25-26 | — | — | — |
| AA | 27 | Refund Amount | Number | Refund issued |
| AB | 28 | — | — | — |
| AC | 29 | Policy | Text | Cancellation policy |
| AD-AE | 30-31 | — | — | — |
| AF | 32 | Claim Date | Date | When case was claimed |
| AG | 33 | Portal | String | Affirm, Amex, Braintree, Chase |
| AH | 34 | Queue Priority | Number | Days to due date |
| AI | 35 | Affirm Link | URL | External link |

#### Controller Sheet (`controllerSheet`)
**Spreadsheet ID**: `1P4MLBYGsco4Wh1TnmnZjaxjNG7GBeZRXeIKf8oF36UQ`
**Sheet Name**: `datasheet`

| Column | Index | Field Name |
|--------|-------|------------|
| A | 1 | ITN |
| D | 4 | Booking Date |
| M | 13 | Hotel Name |
| P | 16 | Check In |
| Q | 17 | Check Out |
| R | 18 | Room Type |
| T-Z | 20-26 | Image File IDs |

#### Additional Sheets

| Variable | Spreadsheet ID | Sheet | Purpose |
|----------|---------------|-------|---------|
| `dashboard` | Same as `ss` | Dashboard | Formula evaluation |
| `tempSheet` | Same as controller | Temp | Temporary calculations |
| `recoverySheet` | `1Gj6LfsQNfFHhFGDfIQ9X63yHjqVLma-luFfvl9Ju4h8` | data | Recovery requests |
| `vbExceptionSheet` | `1ib7kcguVEXFoACNhZUxf-VDFbT-DlP74R9WO9l7FFnk` | data | VB exceptions |
| `emConfirmationSheet` | `1FqABBeWj9L8F4z_RE5DGAdOFoUMp8F6Aq1i_uj3Yy7w` | data/temp | Email confirmation |
| `ResponseSheet` | `1UbklwE_AseDLOShCLXfJPNL69E6Hxm20z9ajfAckNlU` | Responses | Canned responses |

### Script Properties Storage

```javascript
// Session tracking
PropertiesService.getScriptProperties().getProperty("ANALYST_SESSIONS")
// Structure: { "email@domain.com": { lastHeartbeat: timestamp, active: boolean } }

// Analyst status (enable/disable)
PropertiesService.getScriptProperties().getProperty("ANALYST_STATUS")
// Structure: { "email@domain.com": { disabled: boolean, updatedAt: timestamp } }

// Audit log
PropertiesService.getScriptProperties().getProperty("AUDIT_LOG")
// Structure: Array of { timestamp, caseRow, caseId, itn, action, user, details }
```

### Google Drive Folders

| Folder ID | Purpose |
|-----------|---------|
| `1XS3U6wpaPW3DVKEhEy9iPSjjJ91e71SM` | Image uploads (WEX, Accertify, etc.) |
| `1TgubfrYEmPVhphWoWqEs3llZu9fb4NaO` | Confirmation pages |
| `1DNJmU73y3hrqT2nIBnxN31FFvqUt9toG` | Checkout pages |
| `198moy73H6UE4sv3bI-l6gFy3N4CCrOUo` | WEX and refund proofs |
| `1nKCj2b1ZiG53BwNTL-v5D0TS-5Oq4aVb` | Accertify PDFs |

---

## 3. Server-Side Components

### File: `config.gs`

**Purpose**: Central configuration for feature flags, constants, and utilities.

```javascript
// Feature Flags
const FEATURES = {
  ENABLE_CASE_DISTRIBUTION: boolean,
  ENABLE_ADMIN_PANEL: boolean,
  ENABLE_KEYBOARD_SHORTCUTS: boolean,
  ENABLE_SLA_TRACKER: boolean,
  ENABLE_AUDIT_TRAIL: boolean,
  ENABLE_REALTIME_DASHBOARD: boolean
};

// Admin Configuration
const ADMIN_EMAILS = string[];

// Distribution Configuration
const DISTRIBUTION_CONFIG = {
  SESSION_TIMEOUT_MS: number,
  HEARTBEAT_INTERVAL_MS: number,
  MAX_CASES_PER_ANALYST: number,
  TYPE_BALANCE_VARIANCE: number
};

// Dispute Type Mapping
const DISPUTE_TYPE_CATEGORIES = {
  FRAUD: string[],
  SERVICE: string[],
  CUSTOMER: string[],
  HOTEL: string[]
};

// Functions
function categorizeDisputeType(disputeType: string): string
function isCurrentUserAdmin(): boolean
function isAuthorizedAnalyst(): boolean
```

### File: `distribution.gs`

**Purpose**: Case distribution engine, session management, admin functions.

#### Session Management

```javascript
function recordHeartbeat(): { status: string, timestamp: number }
function getActiveAnalysts(): string[]
```

#### Queue Management

```javascript
function getPendingCaseQueue(): Array<{
  row: number,
  caseId: string,
  itn: string,
  dueDate: Date,
  disputeType: string,
  category: string,
  portal: string
}>

function getAnalystCaseCounts(analystEmail: string): {
  FRAUD: number,
  SERVICE: number,
  CUSTOMER: number,
  HOTEL: number,
  UNKNOWN: number,
  total: number
}

function getAllAnalystCaseCounts(): Object
```

#### Distribution Algorithm

```javascript
function getNextDistributedCase(portal?: string): number
// Returns row number of next case, or 0 if none available
```

#### Admin Functions

```javascript
function getAdminDashboardData(): {
  analysts: Array<{
    email: string,
    status: string,
    disabled: boolean,
    casesAssigned: number,
    casesByType: Object,
    lastSeen: string
  }>,
  queueStats: {
    total: number,
    byCategory: Object
  },
  activeAnalystCount: number,
  timestamp: string
}

function setAnalystStatus(email: string, disabled: boolean): Object
function adminAssignCase(row: number, analystEmail: string): Object
function adminUnassignCase(row: number): Object
```

#### Audit Trail

```javascript
function logAuditEvent(
  caseRow: number,
  action: string,
  userEmail: string,
  details: Object
): void

function getCaseAuditLog(caseRow: number): Array<{
  timestamp: string,
  caseRow: number,
  caseId: string,
  itn: string,
  action: string,
  user: string,
  details: Object
}>
```

#### Realtime Stats

```javascript
function getRealtimeQueueStats(): {
  totalPending: number,
  byCategory: Object,
  byPortal: Object,
  urgent: number,
  myAssigned: number,
  myByType: Object,
  activeAnalysts: number,
  timestamp: string
}
```

### File: `casemanagement.gs`

**Purpose**: Core case management logic (preserved from original).

#### Global Variables

```javascript
var ss: GoogleAppsScript.Spreadsheet.Sheet           // Main RCA database
var dashboard: GoogleAppsScript.Spreadsheet.Sheet    // Dashboard sheet
var controllerSheet: GoogleAppsScript.Spreadsheet.Sheet
var tempSheet: GoogleAppsScript.Spreadsheet.Sheet
var recoverySheet: GoogleAppsScript.Spreadsheet.Sheet
var vbExceptionSheet: GoogleAppsScript.Spreadsheet.Sheet
var emConfirmationSheet: GoogleAppsScript.Spreadsheet.Spreadsheet

var Lastrow: number          // Last row of main database
var users: string[]          // Authorized analyst emails
var Fraud: Array<string|number>  // Fraud reason codes
```

#### Core Functions

```javascript
function NotClaimedCasesV4(): number
// Returns row number using FILTER formula

function NotClaimedCasesV2(currency: string, portal: string): number
// Legacy method, iterates through values

function NotClaimedPriority(): number
// Priority queue (0-6 days to due date)

function ClaimCase(row: number): void
// Assigns case to current user

function getCase(portal: string): Array<string|number>
// Main entry point for getting cases
// Integrates with distribution engine if enabled

function searchCase(itn: string): Array<string|number>
// Search case by ITN for current user

function getReservationData(itn: string): Array<string|number>
// Fetch reservation details from controller sheet

function checkClaim(row: number): string[]
// Verify case ownership

function resolveRCA(
  row: number,
  rca: string,
  res: string,
  issuernotes: string,
  internalnotes: string
): string
// Save RCA resolution

function sendForEmailConfirmation(row: number): void
// Trigger email for fraud cases

function agentCount(): Object
// Queue statistics for current user

function createCannedRes(row: number): string
// Generate booking data template
```

### File: `recovery.gs`

**Purpose**: Recovery workflow and pending cases.

```javascript
function sendForRecovery(
  itn: string,
  rnum: string,
  amt: string,
  cin: string,
  cout: string,
  hotel: string,
  cbcode: string,
  notes: string
): string

function sendForVbException(
  itn: string,
  rnum: string,
  amt: string,
  option: string,
  notes: string
): string

function updateRefundAmount(row: number, amount: string): void
function updateRoomType(row: number, roomtype: string): void
function getPendingCases(): Array<Array<string|number>>
```

### File: `uploader.gs`

**Purpose**: File upload handlers.

```javascript
function uploadImageToDrive(
  row: number,
  itn: string,
  inputId: string,
  base64Data: string
): {
  inputId: string,
  status: string,
  name: string,
  url: string
}

function uploadAllFiles(formData: {
  itn: string,
  confirmpage: Object,
  checkoutpage: Object,
  confirmpages?: Object,
  checkoutpages?: Object,
  wexandrefund?: Object,
  accproof?: Object
}): {
  status: string,
  message: string,
  uploaded: string[]
}
```

### File: `cannedresponses.gs`

**Purpose**: User-specific saved templates.

```javascript
function getUserEmail(): string
function getCannedResponses(): Array<{ name: string, response: string, id: number }>
function saveCannedResponse(name: string, response: string): string
```

### File: `doget.gs`

**Purpose**: Web app entry point and routing.

```javascript
function doGet(request: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput
// Routes to MainRCAPage or AdminPanel based on ?page= parameter

function include(filename: string): string
// Template include helper

function getWebAppUrl(): string
function getAdminPanelUrl(): string
```

---

## 4. Client-Side Components

### File: `MainRCAPage.html`

**Structure**:
```html
<!DOCTYPE html>
<html>
<head>
  <!-- Includes Stylesheet.html and RCAResponse.html -->
</head>
<body>
  <header>...</header>
  <div class="container">
    <div class="left-section">
      <!-- Dashboard widget, Get Case, Case Info, Transaction Info, Templates -->
    </div>
    <div class="middle-section">
      <!-- RCA selection, Notes textareas, Action buttons, Pending table -->
    </div>
    <div class="right-section">
      <!-- Image uploads, Recovery, PDF uploads, Queue stats -->
    </div>
  </div>
  <div id="cannedModal">...</div>
  <div class="shortcuts-hint">...</div>
  <!-- Includes JavaScript.html -->
</body>
</html>
```

### File: `AdminPanel.html`

**Structure**:
```html
<!DOCTYPE html>
<html>
<head>
  <!-- Includes Stylesheet.html with admin-specific CSS -->
</head>
<body>
  <header>...</header>
  <div id="loadingOverlay">...</div>
  <div id="accessDenied">...</div>
  <div id="adminContent">
    <div class="admin-header">...</div>
    <div class="summary-stats">...</div>
    <div class="admin-grid">
      <div class="analyst-table">...</div>
      <div class="distribution-summary">...</div>
    </div>
  </div>
  <script>
    // Admin-specific JavaScript
  </script>
</body>
</html>
```

### File: `JavaScript.html`

**Module Structure**:

```javascript
// ═══ INITIALIZATION ═══
document.addEventListener('DOMContentLoaded', function() {...})

// ═══ STATUS & NOTIFICATIONS ═══
function statusUpdate(msg, type)
function showToast(message, type)

// ═══ HEARTBEAT & SESSION ═══
function startHeartbeat()
function sendHeartbeat()

// ═══ REALTIME DASHBOARD ═══
function refreshDashboard()
function updateDashboardUI(data)

// ═══ COLLAPSIBLE SECTIONS ═══
function initializeSections()
function toggleSection(sectionId)

// ═══ KEYBOARD SHORTCUTS ═══
function setupKeyboardShortcuts()

// ═══ CASE OPERATIONS ═══
function getCase()
function inputCaseInfo(data)
function updatesearch(data)
function updateTtable(data)
function getInfo()
function Resolve()
function clearTableData()

// ═══ FILE UPLOADS ═══
function setupUploadBoxes()
function saveFiles1()
function uploadFiles()
function getBase64FromImage(imageUrl)

// ═══ RECOVERY ═══
function RecoveryReq()

// ═══ PENDING CASES ═══
function getPendingCases()
function updatePending(data)
function hidePendingTable()
function DeadlineReaching()

// ═══ QUEUE STATS ═══
function getCount()

// ═══ UTILITIES ═══
function copyToClipboard(labelId)
function editCell(editIcon)
function saveCell(input, td, saveIcon, currTd)
function AffirmLink(link)
function updateSLAIndicator()
function reviewDate(cell)

// ═══ CANNED RESPONSES ═══
function addCannedResponse(response)
function showCannedModal()
function closeCannedModal()
function fetchCannedResponses()
function loadCannedResponse()
function saveCanned()
function clearCanned()
function insertCanned()
function getBookingData()
```

### File: `Stylesheet.html`

**CSS Architecture**:

```css
/* ═══ FONTS ═══ */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

/* ═══ CSS VARIABLES ═══ */
:root {
  /* Backgrounds, Borders, Text, Accents, Status, Shadows, Spacing, Radius */
}

/* ═══ RESET & BASE ═══ */
/* ═══ TYPOGRAPHY ═══ */
/* ═══ HEADER ═══ */
/* ═══ MAIN CONTAINER ═══ */
/* ═══ SECTIONS ═══ */
/* ═══ FORM ELEMENTS ═══ */
/* ═══ BUTTONS ═══ */
/* ═══ TABLES ═══ */
/* ═══ RCA SECTION ═══ */
/* ═══ UPLOAD BOX ═══ */
/* ═══ QUEUE STATUS ═══ */
/* ═══ SLA TRACKER ═══ */
/* ═══ WORKING RCA ═══ */
/* ═══ PDF UPLOADS ═══ */
/* ═══ ACTION ICONS ═══ */
/* ═══ MODAL ═══ */
/* ═══ TOAST NOTIFICATIONS ═══ */
/* ═══ KEYBOARD SHORTCUTS HINT ═══ */
/* ═══ DASHBOARD WIDGET ═══ */
/* ═══ ADMIN PANEL ═══ */
/* ═══ SCROLLBAR ═══ */
/* ═══ RESPONSIVE ═══ */
/* ═══ ANIMATIONS ═══ */
```

### File: `RCAResponse.html`

**Template Switch Statement**:

```javascript
function fetchResponse() {
  // Handles 30+ RCA types with auto-fill templates
  switch (rca) {
    case "Customer - Cancel policy dispute/Non Refundable": ...
    case "Risk - Fraudulent Transaction": ...
    // ... etc
  }
}
```

---

## 5. API Reference

### Client → Server Communication

All server calls use `google.script.run`:

```javascript
google.script.run
  .withSuccessHandler(callback)
  .withFailureHandler(errorHandler)
  .serverFunction(params);
```

### Available Server Functions

| Function | Parameters | Returns | Purpose |
|----------|------------|---------|---------|
| `recordHeartbeat` | none | `{status, timestamp}` | Session tracking |
| `getRealtimeQueueStats` | none | Stats object | Dashboard data |
| `getCase` | `portal` | Array | Get/claim case |
| `searchCase` | `itn` | Array | Search by ITN |
| `getReservationData` | `itn` | Array | Transaction info |
| `checkClaim` | `row` | `[msg, color, fontcolor]` | Verify ownership |
| `resolveRCA` | `row, rca, res, issuer, internal` | `string` | Save resolution |
| `getPendingCases` | none | Array of arrays | User's pending |
| `agentCount` | none | Counts object | Queue stats |
| `createCannedRes` | `row` | `string` | Booking data |
| `sendForRecovery` | 8 params | `string` | Recovery request |
| `sendForVbException` | 5 params | `string` | VB exception |
| `updateRefundAmount` | `row, amount` | none | Update refund |
| `updateRoomType` | `row, roomtype` | none | Update room |
| `uploadImageToDrive` | `row, itn, inputId, base64` | Upload result | Image upload |
| `uploadAllFiles` | `formData` | Upload result | PDF upload |
| `getCannedResponses` | none | Array | User templates |
| `saveCannedResponse` | `name, response` | `string` | Save template |
| `isCurrentUserAdmin` | none | `boolean` | Auth check |
| `getAdminDashboardData` | none | Dashboard object | Admin data |
| `setAnalystStatus` | `email, disabled` | Result object | Enable/disable |

---

## 6. Data Flow Diagrams

### Case Claiming Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐
│  Client  │────▶│   getCase()  │────▶│ Distribution    │
│          │     │              │     │ Engine          │
└──────────┘     └──────────────┘     └────────┬────────┘
                                               │
                        ┌──────────────────────┘
                        ▼
              ┌─────────────────┐
              │ getNextDistri-  │
              │ butedCase()     │
              └────────┬────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
┌─────────────────┐       ┌─────────────────┐
│ getPending-     │       │ getAnalystCase- │
│ CaseQueue()     │       │ Counts()        │
└────────┬────────┘       └────────┬────────┘
         │                         │
         └──────────┬──────────────┘
                    ▼
         ┌─────────────────┐
         │ Calculate best  │
         │ category match  │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  ClaimCase()    │
         │  + Audit Log    │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Return case     │
         │ data to client  │
         └─────────────────┘
```

### Session Tracking Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT SIDE                              │
│                                                               │
│  ┌─────────────┐    60s interval    ┌─────────────────────┐  │
│  │ Page Load   │──────────────────▶│ sendHeartbeat()     │  │
│  │             │                    │ setInterval(60000)  │  │
│  └─────────────┘                    └──────────┬──────────┘  │
└──────────────────────────────────────────────────┼───────────┘
                                                   │
                                                   ▼
┌──────────────────────────────────────────────────────────────┐
│                      SERVER SIDE                              │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  recordHeartbeat()                       │ │
│  │                                                          │ │
│  │  1. Get user email                                       │ │
│  │  2. Verify user in authorized list                       │ │
│  │  3. Load sessions from Script Properties                 │ │
│  │  4. Update user's lastHeartbeat timestamp                │ │
│  │  5. Save sessions back to Script Properties              │ │
│  │  6. Return { status: "ok", timestamp }                   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              getActiveAnalysts()                         │ │
│  │                                                          │ │
│  │  1. Load sessions from Script Properties                 │ │
│  │  2. Load analyst status (enabled/disabled)               │ │
│  │  3. Calculate cutoff = now - 5 minutes                   │ │
│  │  4. Filter: lastHeartbeat > cutoff AND not disabled      │ │
│  │  5. Return list of active analyst emails                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Security Model

### Authentication

- **Method**: Google Workspace SSO (automatic via Apps Script)
- **User Identity**: `Session.getActiveUser().getEmail()`
- **Session**: Managed by Google, no custom tokens

### Authorization Levels

| Level | Check | Access |
|-------|-------|--------|
| **Unauthorized** | Email not in `users` array | No access |
| **Analyst** | Email in `users` array | Full analyst features |
| **Admin** | Email in `ADMIN_EMAILS` array | Admin panel + analyst features |

### Authorization Checks

```javascript
// Analyst check (in casemanagement.gs)
if (users.includes(Session.getActiveUser().getEmail())) {
  // Allow operation
}

// Admin check (in config.gs)
function isCurrentUserAdmin() {
  return ADMIN_EMAILS.includes(Session.getActiveUser().getEmail());
}
```

### Data Access Control

| Resource | Who Can Access |
|----------|---------------|
| Own claimed cases | Analyst who claimed |
| All pending cases | Any authorized analyst |
| Admin dashboard | Admin only |
| Enable/disable analysts | Admin only |
| Audit logs | System (automatic) |

### Sensitive Data Handling

- Sheet IDs are hardcoded (consider moving to properties)
- Drive folder IDs are in code
- No PII is exposed to client beyond case data

---

## 8. Performance Considerations

### Batch Operations

**Problem**: Individual `getRange().getValue()` calls are slow.

**Current State**: `getCase()` makes 17 individual calls.

**Recommendation**: Use batch reads:

```javascript
// Instead of:
data.push(ss.getRange(row, 1).getValue());
data.push(ss.getRange(row, 2).getValue());
// ... 15 more

// Use:
const rowData = ss.getRange(row, 1, 1, 35).getValues()[0];
data.push(rowData[0], rowData[1], ...);
```

### Caching Opportunities

| Data | Cache Method | TTL |
|------|-------------|-----|
| `users` array | Already global | Script lifetime |
| Pending queue | `CacheService` | 60 seconds |
| Analyst counts | `CacheService` | 30 seconds |
| Session data | `PropertiesService` | Real-time |

### Query Optimization

**Current**: `NotClaimedCasesV4()` uses formula evaluation (clever but adds latency).

**Alternative**: Direct data filtering in JS (trade-off: more data transfer).

### Quotas to Monitor

| Quota | Limit | Current Usage |
|-------|-------|---------------|
| Script runtime | 6 min (consumer) / 30 min (Workspace) | Low |
| URL Fetch | 20,000/day | Minimal |
| Properties | 9KB per value, 500KB total | Session data |
| Triggers | 20 per script | 0 (no triggers) |

---

## 9. Error Handling

### Server-Side

```javascript
// Pattern used
try {
  // Operation
  return { success: true, data: result };
} catch (error) {
  Logger.log('Error: ' + error.toString());
  return { success: false, error: error.message };
}
```

### Client-Side

```javascript
google.script.run
  .withSuccessHandler(function(response) {
    if (response.error) {
      showToast('Error: ' + response.error, 'error');
    } else {
      // Handle success
    }
  })
  .withFailureHandler(function(error) {
    showToast('System error: ' + error.message, 'error');
  })
  .serverFunction();
```

### Error Types

| Type | Handling |
|------|----------|
| Authorization | Return message, show to user |
| Data not found | Return empty/zero, UI handles |
| Upload failure | Throw error, catch in client |
| Quota exceeded | System error (rare) |

---

## 10. Testing Guide

### Manual Testing Checklist

#### Case Management
- [ ] Get case from each portal
- [ ] Search case by ITN
- [ ] Verify case info display
- [ ] Verify transaction info fetch
- [ ] Resolve case with all fields
- [ ] Resolve triggers email confirmation (fraud cases)

#### Distribution
- [ ] Multiple analysts get balanced cases
- [ ] Priority queue works (0-6 days)
- [ ] Type balancing distributes evenly
- [ ] Inactive analyst cases available to others

#### Admin Panel
- [ ] Access denied for non-admins
- [ ] Dashboard loads for admins
- [ ] Analyst table shows correct status
- [ ] Enable/disable works
- [ ] Category counts match reality

#### File Uploads
- [ ] Image paste works
- [ ] Image upload saves to Drive
- [ ] PDF upload works
- [ ] Required field validation

### Debug Functions

Add temporarily for testing:

```javascript
function debugQueueState() {
  const queue = getPendingCaseQueue();
  const analysts = getActiveAnalysts();
  const counts = getAllAnalystCaseCounts();
  
  Logger.log('Queue: ' + queue.length + ' cases');
  Logger.log('Active: ' + analysts.length + ' analysts');
  Logger.log('Counts: ' + JSON.stringify(counts));
  
  return { queue: queue.length, analysts, counts };
}
```

---

## 11. Deployment

### Initial Deployment

1. Create new Apps Script project
2. Copy all files
3. Configure `config.gs`
4. Deploy as web app
5. Authorize scopes
6. Share URL with users

### Update Deployment

1. Make changes
2. Test in editor
3. Deploy → Manage deployments
4. Create new version
5. Update description with version number

### Rollback

1. Manage deployments
2. Archive current version
3. Activate previous version

### Environment Variables

Consider moving to Script Properties:

```javascript
// Instead of hardcoded:
var ss = SpreadsheetApp.openById("1LxZiB...");

// Use:
var ss = SpreadsheetApp.openById(
  PropertiesService.getScriptProperties().getProperty('RCA_SHEET_ID')
);
```

---

## 12. Migration Guide

### From v4.0.x to v4.1.1

#### Breaking Changes
- None (backward compatible)

#### New Files to Add
- `config.gs`
- `distribution.gs`
- `AdminPanel.html`

#### Files to Replace
- `Stylesheet.html` (complete rewrite)
- `MainRCAPage.html` (enhanced)
- `JavaScript.html` (enhanced)
- `doget.gs` (routing added)
- `casemanagement.gs` (distribution wrapper)

#### Configuration Required
1. Add admin emails to `ADMIN_EMAILS`
2. Review `DISPUTE_TYPE_CATEGORIES` mapping
3. Optionally adjust `DISTRIBUTION_CONFIG` timeouts

#### Data Migration
- None required
- Session data auto-initializes on first heartbeat

---

## 13. Dependencies

### External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Google Fonts | Latest | Space Grotesk, Space Mono |
| Font Awesome | 6.0.0-beta3 | Icons (loaded but minimally used) |

### Google Services Used

| Service | Purpose |
|---------|---------|
| `SpreadsheetApp` | Sheet operations |
| `DriveApp` | File uploads |
| `Session` | User authentication |
| `HtmlService` | Web app rendering |
| `PropertiesService` | Settings storage |
| `Utilities` | Date formatting, base64 |
| `Logger` | Debug logging |
| `ScriptApp` | URL generation |

### Scopes Required

```
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/drive
https://www.googleapis.com/auth/script.external_request
```

---

## 14. Known Limitations

### Platform Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| 6-min execution limit | Long operations may timeout | Batch operations |
| No WebSockets | No real-time push | Polling (heartbeat) |
| Script Properties 9KB | Large audit logs truncate | Keep last N entries |
| No cron < 1 minute | Heartbeat relies on client | Client-side interval |

### Application Limitations

| Limitation | Impact | Future Fix |
|------------|--------|------------|
| Single-tab session | Multiple tabs = multiple heartbeats | Detect duplicate tabs |
| No offline mode | Requires internet | N/A (by design) |
| Manual refresh for dashboard | Data may be stale | WebSocket alternative |
| Hardcoded Sheet IDs | Environment-specific | Properties migration |

### Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome | ✅ Fully supported |
| Firefox | ✅ Fully supported |
| Safari | ✅ Supported |
| Edge | ✅ Supported |
| IE11 | ❌ Not supported |

---

## 15. Future Roadmap

### Planned Features

| Feature | Priority | Complexity | Status |
|---------|----------|------------|--------|
| Email notifications | Medium | Low | Planned |
| Bulk case operations | High | Medium | Planned |
| Performance dashboard | Medium | Medium | Planned |
| Export to CSV | Low | Low | Planned |
| Dark/light theme toggle | Low | Low | Planned |

### Technical Debt

| Item | Priority | Effort |
|------|----------|--------|
| Batch getRange calls | High | Medium |
| Move IDs to Properties | Medium | Low |
| Add unit tests | Medium | High |
| TypeScript migration | Low | High |
| Documentation comments | Low | Medium |

### Architecture Improvements

| Improvement | Benefit |
|-------------|---------|
| Service layer abstraction | Easier testing |
| Event-driven updates | Better UX |
| Modular CSS | Easier maintenance |
| Build pipeline | Minification, versioning |

---

## Appendix A: Authorized Users

Current `users` array (26 analysts):

```javascript
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
```

---

## Appendix B: Column Reference Quick Guide

### Main Database (ss) - Key Columns

```
Col  │ Index │ Field
─────┼───────┼────────────────────
A    │   1   │ Case ID
B    │   2   │ ITN
D    │   4   │ Reason Code
E    │   5   │ Dispute Date
F    │   6   │ Due Date
G    │   7   │ Dispute Amount
I    │   9   │ Reservation #
J    │  10   │ Transaction Amount
L    │  12   │ Currency
M    │  13   │ Dispute Type ★
Q    │  17   │ RCA Status
R    │  18   │ Analyst Email
S    │  19   │ Resolve Date
T    │  20   │ Issuer Notes
U    │  21   │ Rebuttal
V    │  22   │ Internal Notes
AA   │  27   │ Refund Amount
AC   │  29   │ Policy
AF   │  32   │ Claim Date
AG   │  33   │ Portal
AH   │  34   │ Queue Priority
AI   │  35   │ Affirm Link
```

★ = Used for distribution categorization

---

<div align="center">

**CBMS RCA Manager v4.1.1 — Technical Documentation**

*Last Updated: December 2024*

</div>

