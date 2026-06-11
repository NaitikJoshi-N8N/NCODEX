#  CBMS RCA Manager

<div align="center">

![Version](https://img.shields.io/badge/version-4.1.1-00ff88?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Google%20Apps%20Script-4285F4?style=for-the-badge)
![License](https://img.shields.io/badge/license-Internal-555555?style=for-the-badge)

**Chargeback Management System — Root Cause Analysis Module**

*A premium, dark-themed case management interface for analyzing and resolving payment disputes.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [What's New in v4.1.1](#-whats-new-in-v411)
- [Features](#-features)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [User Interface](#-user-interface)
- [Case Distribution System](#-case-distribution-system)
- [Admin Panel](#-admin-panel)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [File Structure](#-file-structure)
- [Changelog](#-changelog)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🎯 Overview

The CBMS RCA Manager is a Google Apps Script web application designed for managing chargeback disputes and root cause analysis. It provides analysts with tools to:

- Claim and process dispute cases from a dynamic queue
- Document findings with standardized rebuttal templates
- Upload supporting evidence (images and PDFs)
- Track case status and deadlines
- Submit cases for recovery when needed

### Technology Stack

| Component | Technology |
|-----------|------------|
| Backend | Google Apps Script (.gs) |
| Frontend | HTML5 / CSS3 / Vanilla JavaScript |
| Data Storage | Google Sheets |
| File Storage | Google Drive |
| UI Framework | Custom (no external frameworks) |

---

## 🆕 What's New in v4.1.1

### Major Features

| Feature | Description |
|---------|-------------|
| 🎨 **Premium Dark Theme** | Complete UI overhaul with professional dark aesthetic |
| 📊 **Case Distribution Engine** | Dynamic, expiry-aware queue system for fair workload distribution |
| 👑 **Admin Panel** | Dedicated dashboard for managing analysts and monitoring distribution |
| ⌨️ **Keyboard Shortcuts** | Power-user hotkeys for faster workflow |
| ⏱️ **SLA Tracker** | Visual countdown indicators for case deadlines |
| 📈 **Realtime Dashboard** | Live queue statistics widget |
| 📝 **Audit Trail** | Action logging for accountability |

### UI/UX Improvements

- **Typography**: Space Grotesk (UI) + Space Mono (data/numbers)
- **Color Scheme**: High-contrast dark theme with green accents
- **Animations**: Subtle transitions and micro-interactions
- **Responsive Layout**: Adapts to different screen sizes
- **Toast Notifications**: Non-intrusive feedback messages
- **Collapsible Sections**: Cleaner, more organized interface

### Technical Improvements

- Feature flag system for toggling functionality
- Session-based activity tracking via heartbeat
- Improved error handling and user feedback
- Batch data operations for better performance
- Modular code architecture

---

## ✨ Features

### Core Functionality

#### Case Management
- **Get Case**: Fetch next available case from queue
- **Search Case**: Find specific case by ITN (Merchant Order #)
- **Claim Case**: Assign case to current analyst
- **Resolve Case**: Submit RCA with rebuttal response

#### Evidence Management
- **Image Upload**: Paste or upload images (WEX, Accertify, Refunds, etc.)
- **PDF Upload**: Upload confirmation pages, checkout pages, proofs
- **Google Drive Integration**: Automatic file organization

#### Templates & Responses
- **30+ Pre-built RCA Templates**: Auto-fill rebuttal responses
- **Custom Templates**: Save and reuse personal response templates
- **Booking Data Insertion**: Auto-generate booking details

#### Recovery Workflow
- **Recovery Request**: Submit cases for hotel recovery
- **VB Exception Logging**: Document exceptions (Outside Penalty, Denied, Waived)

### Advanced Features

#### Realtime Dashboard Widget
```
┌─────────────────────────────────┐
│       QUEUE OVERVIEW            │
├─────────────────────────────────┤
│ Total Pending     │     156     │
│ Urgent (<2 days)  │      12     │
│ My Assigned       │       8     │
│ Active Analysts   │      14     │
└─────────────────────────────────┘
```

#### SLA Tracking
| Days Remaining | Indicator | Color |
|----------------|-----------|-------|
| > 5 days | `5d` | 🟢 Green |
| 3-5 days | `4d` | 🟡 Yellow |
| 1-2 days | `2d ⚠️` | 🟠 Orange |
| < 1 day | `URGENT ⚠️` | 🔴 Red (pulsing) |

#### Queue Statistics
- Personal case count
- Fraud case count
- Priority queue count
- Per-portal counts (Affirm, Amex, Braintree, Chase)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl` + `Enter` | **Resolve** | Submit the current case |
| `Ctrl` + `N` | **Next Case** | Fetch the next case from queue |
| `Ctrl` + `P` | **Pending** | View your pending cases |
| `Esc` | **Clear/Close** | Clear form or close modal |

### Tips for Power Users

1. **Quick Resolution Flow**:
   - Get case → Select RCA → Check auto-fill checkbox → `Ctrl+Enter`
   
2. **Batch Processing**:
   - Use keyboard shortcuts to minimize mouse usage
   - Keep ITN field empty for continuous queue processing

3. **Template Efficiency**:
   - Save frequently used custom responses
   - Use "Booking Data" button to auto-populate case details

---

## 🎨 User Interface

### Design System

#### Color Palette

```css
/* Backgrounds */
--bg-primary: #000000;     /* Main background */
--bg-secondary: #0a0a0a;   /* Header, panels */
--bg-elevated: #111111;    /* Hover states */
--bg-card: #151515;        /* Cards, sections */

/* Text */
--text-primary: #ffffff;   /* Main text */
--text-secondary: #888888; /* Secondary text */
--text-muted: #555555;     /* Disabled, hints */

/* Accents */
--accent-green: #00ff88;   /* Primary actions, success */
--accent-red: #ff0055;     /* Errors, urgent */
--accent-yellow: #ffcc00;  /* Warnings */
--accent-blue: #0088ff;    /* Info, links */
```

#### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Headings | Space Grotesk | 600-700 | 14-24px |
| Body | Space Grotesk | 400 | 13-14px |
| Labels | Space Grotesk | 500 | 10-11px |
| Data/Numbers | Space Mono | 700 | 13-18px |
| Meta Labels | Space Grotesk | 500 | 9-11px |

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Logo • Status Bar                                      │
├──────────────┬────────────────────────────┬────────────────────┤
│              │                            │                    │
│  LEFT        │  MIDDLE                    │  RIGHT             │
│  SECTION     │  SECTION                   │  SECTION           │
│              │                            │                    │
│  • Dashboard │  • RCA Selection           │  • Image Uploads   │
│  • Get Case  │  • Issuer Notes            │  • Recovery        │
│  • Case Info │  • Rebuttal Response       │  • PDF Uploads     │
│  • Trans Info│  • Internal Notes          │  • Queue Stats     │
│  • Templates │  • Pending Cases           │                    │
│              │                            │                    │
└──────────────┴────────────────────────────┴────────────────────┘
│  SHORTCUTS HINT: Ctrl+Enter Resolve • Ctrl+N Next • Esc Clear  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Case Distribution System

### Overview

The Case Distribution Engine ensures fair, balanced workload across active analysts using a dynamic, expiry-aware queue system.

### Key Principles

1. **No Permanent Assignment**: Cases are pulled from a shared queue, not pre-assigned
2. **Expiry Priority**: Cases nearest to deadline are served first
3. **Type Balancing**: Even distribution across FRAUD, SERVICE, CUSTOMER, HOTEL categories
4. **Auto-Rebalancing**: When analysts go inactive, their unclaimed cases return to queue

### Algorithm Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CASE DISTRIBUTION FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Analyst requests next case                                   │
│           │                                                      │
│           ▼                                                      │
│  2. System checks analyst's current case distribution            │
│     (counts by type: FRAUD, SERVICE, CUSTOMER, HOTEL)            │
│           │                                                      │
│           ▼                                                      │
│  3. Calculate target distribution:                               │
│     target = total_pending_by_type / active_analyst_count        │
│           │                                                      │
│           ▼                                                      │
│  4. Find category where analyst is BELOW target                  │
│           │                                                      │
│           ▼                                                      │
│  5. Return oldest case (nearest expiry) from that category       │
│           │                                                      │
│           ▼                                                      │
│  6. If all categories balanced → return absolute oldest case     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Dispute Type Categories

| Category | Keywords Matched |
|----------|------------------|
| **FRAUD** | Fraud, 10.4, 37, AA, Card not present, Does Not Recognize, No knowledge, U02, Not Recognized |
| **SERVICE** | INQ, Inquiry, Cancel, Cancellation, Service |
| **OTHER** | TO BE DEFINED |
| **CANCELLATION** | TO BE DEFINED |

### Session Tracking

- **Heartbeat Interval**: Every 60 seconds
- **Session Timeout**: 5 minutes of inactivity
- **Active Detection**: Based on heartbeat timestamp

---

## 👑 Admin Panel

### Access

- **URL**: `https://[your-app-url]/exec?page=admin`
- **Authorization**: Only emails in `ADMIN_EMAILS` array can access

### Features

#### Analyst Management
- View all analysts with real-time status
- See case counts per analyst (total + by type)
- Enable/disable analysts
- View last activity timestamp

#### Distribution Summary
- Total pending cases
- Cases by category (FRAUD, SERVICE, CANCELLATION, OTHER)
- Active analyst count
- Urgent cases count

#### Status Indicators

| Status | Description | Visual |
|--------|-------------|--------|
| **Active** | Heartbeat < 5 minutes | 🟢 Green dot |
| **Idle** | Heartbeat > 5 minutes | 🟡 Yellow dot |
| **Offline** | No recent heartbeat | ⚪ Gray dot |
| **Disabled** | Manually disabled by admin | 🔴 Red dot |

### Admin Actions

1. **Disable Analyst**: Remove from case distribution (cases won't be assigned)
2. **Enable Analyst**: Return to active distribution pool
3. **Refresh Dashboard**: Manual data refresh

---

## 🚀 Installation

### Prerequisites

- Google Workspace account
- Access to Google Apps Script
- Required Google Sheets (see Technical Documentation)
- Google Drive folders for file uploads

### Step-by-Step

#### 1. Create Apps Script Project

```
1. Go to script.google.com
2. Click "New Project"
3. Name it "CBMS RCA Manager v4.1.1"
```

#### 2. Add Script Files

Create the following `.gs` files (Code.gs → rename to match):

| File Name | Content From |
|-----------|--------------|
| `config` | config.gs |
| `distribution` | distribution.gs |
| `casemanagement` | casemanagement.gs |
| `recovery` | recovery.gs |
| `uploader` | uploader.gs |
| `cannedresponses` | cannedresponses.gs |
| `doget` | doget.gs |

#### 3. Add HTML Files

Create HTML files with exact names:

- `MainRCAPage.html`
- `AdminPanel.html`
- `Stylesheet.html`
- `JavaScript.html`
- `RCAResponse.html`

#### 4. Configure Settings

Edit `config.gs`:

```javascript
// Add admin emails
const ADMIN_EMAILS = [
  "your.admin@company.com"
];

// Toggle features as needed
const FEATURES = {
  ENABLE_CASE_DISTRIBUTION: true,
  ENABLE_ADMIN_PANEL: true,
  // ...
};
```

#### 5. Deploy

```
1. Click "Deploy" → "New deployment"
2. Type: Web app
3. Execute as: Me
4. Who has access: Anyone within [your organization]
5. Click "Deploy"
6. Authorize when prompted
7. Copy the web app URL
```

---

## ⚙️ Configuration

### Feature Flags

Located in `config.gs`:

```javascript
const FEATURES = {
  ENABLE_CASE_DISTRIBUTION: true,   // Dynamic queue distribution
  ENABLE_ADMIN_PANEL: true,         // Admin dashboard access
  ENABLE_KEYBOARD_SHORTCUTS: true,  // Hotkey support
  ENABLE_SLA_TRACKER: true,         // Due date indicators
  ENABLE_AUDIT_TRAIL: true,         // Action logging
  ENABLE_REALTIME_DASHBOARD: true   // Queue overview widget
};
```

### Distribution Settings

```javascript
const DISTRIBUTION_CONFIG = {
  SESSION_TIMEOUT_MS: 5 * 60 * 1000,   // 5 minutes
  HEARTBEAT_INTERVAL_MS: 60 * 1000,    // 60 seconds
  MAX_CASES_PER_ANALYST: 50,           // Overflow threshold
  TYPE_BALANCE_VARIANCE: 1             // Allowed ±1 variance
};
```

### Admin Access

```javascript
const ADMIN_EMAILS = [
  "admin1@company.com",
  "admin2@company.com"
];
```

### Dispute Type Mapping

Customize in `config.gs` → `DISPUTE_TYPE_CATEGORIES`:

```javascript
const DISPUTE_TYPE_CATEGORIES = {
  FRAUD: ["Fraud", "10.4", "37", ...],
  SERVICE: ["INQ", "Cancel", ...],
  CUSTOMER: ["Customer", "Tax", ...],
  HOTEL: ["Hotel", "Room", ...]
};
```

---

## 📖 Usage Guide

### For Analysts

#### Getting Started

1. Navigate to the web app URL
2. Your session is automatically tracked via heartbeat
3. The realtime dashboard shows current queue status

#### Processing Cases

**Method 1: Queue Processing**
1. Select a portal from dropdown (or leave empty for any)
2. Click "Get Case" or press `Ctrl+N`
3. Review case info on the left panel
4. Select RCA from dropdown
5. Check the checkbox to auto-fill rebuttal template
6. Edit/add issuer notes and internal notes
7. Click "Resolve Case" or press `Ctrl+Enter`

**Method 2: Search by ITN**
1. Enter ITN in the search field
2. Click "Get Case"
3. Process as above

#### Uploading Evidence

**Images (paste method)**:
1. Copy image to clipboard
2. Click on upload box to focus
3. Press `Ctrl+V` to paste
4. Click "Upload All Images"

**PDFs**:
1. Select files using file inputs
2. Confirmation and Checkout pages are required
3. Click "Upload All PDFs"

#### Recovery Requests

1. Ensure transaction info is loaded
2. Enter recovery notes
3. Select option (Recovery Needed, Outside Penalty, etc.)
4. Click "Submit"

### For Admins

#### Accessing Admin Panel

1. Navigate to `[app-url]?page=admin`
2. System verifies your email against `ADMIN_EMAILS`
3. If authorized, dashboard loads automatically

#### Monitoring Distribution

- Review analyst table for workload balance
- Check category cards for queue composition
- Identify bottlenecks (analysts with too many cases)

#### Managing Analysts

- **Disable**: Click "Disable" to remove from distribution
- **Enable**: Click "Enable" to return to pool
- Disabled analysts won't receive new cases but keep existing ones

---

## 📁 File Structure

```
/RCA/
├── config.gs              # Feature flags, settings, constants
├── distribution.gs        # Case distribution engine
├── casemanagement.gs      # Core case management logic
├── recovery.gs            # Recovery and pending cases
├── uploader.gs            # File upload handlers
├── cannedresponses.gs     # Custom template management
├── doget.gs               # Web app entry point
├── MainRCAPage.html       # Main analyst interface
├── AdminPanel.html        # Admin dashboard
├── Stylesheet.html        # CSS styles (dark theme)
├── JavaScript.html        # Client-side functionality
├── RCAResponse.html       # RCA auto-fill templates
├── README.md              # This file
└── TECHNICAL.md           # Technical documentation
```

---

## 📜 Changelog

### Version 4.1.1 (December 2024)

#### Added
- ✨ Complete UI redesign with premium dark theme
- ✨ Case Distribution Engine with fair workload balancing
- ✨ Admin Panel for distribution management
- ✨ Keyboard shortcuts (Ctrl+Enter, Ctrl+N, Ctrl+P, Esc)
- ✨ SLA Tracker with visual countdown indicators
- ✨ Realtime Dashboard widget
- ✨ Session tracking via heartbeat mechanism
- ✨ Audit trail logging
- ✨ Toast notifications for feedback
- ✨ Feature flag system

#### Changed
- 🔄 Typography: Arial → Space Grotesk / Space Mono
- 🔄 Color scheme: Light blue → Dark (#000000)
- 🔄 Layout: Fixed → Responsive grid
- 🔄 Sections: Static → Collapsible

#### Fixed
- 🐛 N/A (new implementation)

#### Security
- 🔒 Admin panel access restricted by email whitelist
- 🔒 Analyst authorization preserved from original system

### Version History

| Version | Date | Description |
|---------|------|-------------|
| 4.1.1 | Dec 2024 | UI modernization, distribution system, admin panel |
| 4.1.0 | — | Previous version (light theme) |
| 4.0.x | — | Legacy versions |

---

## 🔧 Troubleshooting

### Common Issues

#### "You are not Authorized"
- **Cause**: Your email is not in the `users` array
- **Solution**: Contact admin to add your email to `casemanagement.gs`

#### Cases not appearing in queue
- **Cause**: No pending cases match your portal filter
- **Solution**: Try different portal or leave empty for all

#### Admin panel shows "Access Denied"
- **Cause**: Your email is not in `ADMIN_EMAILS`
- **Solution**: Add your email to `config.gs` → `ADMIN_EMAILS`

#### Heartbeat not recording
- **Cause**: Browser blocking script execution
- **Solution**: Ensure popups/scripts allowed for the domain

#### Images not uploading
- **Cause**: Transaction info not loaded
- **Solution**: Click "Get Info" before uploading

### Debug Mode

Add to browser console:
```javascript
// Check heartbeat status
google.script.run.withSuccessHandler(console.log).recordHeartbeat();

// Check queue stats
google.script.run.withSuccessHandler(console.log).getRealtimeQueueStats();
```

---

## 🤝 Contributing

### Code Style

- Use 2-space indentation
- camelCase for variables and functions
- UPPER_SNAKE_CASE for constants
- JSDoc comments for public functions

### Adding Features

1. Add feature flag to `config.gs`
2. Implement behind flag check
3. Update README and TECHNICAL docs
4. Test with flag on/off

### Pull Request Guidelines

1. Describe changes clearly
2. Note any breaking changes
3. Update version number
4. Update changelog

---

## 📞 Support

For issues or questions:
1. Check this README first
2. Review TECHNICAL.md for implementation details
3. Contact the development team

---

<div align="center">

**CBMS RCA Manager v4.1.1**

Built with ❤️ for the Chargeback Management Team

*© 2024 Internal Use Only*

</div>

