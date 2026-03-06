---
stepsCompleted: ["01-validate-prerequisites", "02-design-epics", "03-create-stories"]
status: "Finalized - Ready for Development"
---

# sreyleng-fintrack-flutter - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for sreyleng-fintrack-flutter, decomposing the requirements from the PRD, UX Design (referenced via AppSheet screenshots), and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR1:** Authentication via Google Sign-In with a strict 2-user security allowlist preventing unauthorized access.
- **FR2:** Manual Data Entry parity featuring Enum dropdowns for Accounts/Sources and a specialized +/- Amount toggle.
- **FR3:** Single Receipt OCR (Smart Scan) integrating Gemini 1.5 Flash for automatic transaction field extraction.
- **FR4:** Android OS native Share Intent allowing users to share ABA digital receipts directly to the app for immediate OCR and pre-filling.
- **FR5:** Batch Statement OCR for uploading and extracting multiple transactions simultaneously.
- **FR6:** Dashboard widgets mirroring existing AppSheet charts (Earn/Expense Pie charts, YoY comparisons, By Account bar chart, Trend line, Net save list).
- **FR7:** Global advanced filtering (Account, Date, Source, Month, Year) seamlessly applicable to both transaction lists and dashboard widgets.
- **FR8:** Bottom or Top navigation explicitly separating Transactions, Dashboard, Add, Account, and By Month views.
- **FR9:** Local push notification reminders for monthly summaries (configurable trigger date).
- **FR10:** Two-way real-time data sync with existing Excel sheet (bridging Firestore & MS Graph API). *(Note: Architecture document marks this as deferred for v1 due to Spark Plan networking limitations).*

### NonFunctional Requirements

- **NFR1:** Offline-First Architecture: Fully functional reading/writing without internet, robust local queueing, and automatic background sync.
- **NFR2:** Cost Constraint: Zero-cost production infrastructure targeting strictly Firebase Spark and Gemini Free tiers.
- **NFR3:** Clean Architecture implementation: Feature-first structure using Riverpod (State/DI), GoRouter (Navigation), `freezed` & `json_serializable` (Models), and `dio` (Network).
- **NFR4:** Build Target: Android APK deployment.

### Additional Requirements

- **AR1:** UI/UX Reference: Must closely reference and improve upon the existing AppSheet screenshots located at `d:\Source code\sreyleng-fintrack-flutter\_bmad-output\appsheet version\screenshots appsheet`.
- **AR2:** Safety & Project Isolation: Flutter codebase setup must be in an isolated directory, strictly decoupled from the old Angular prototype.

### PRD FR Cross-Reference

> The PRD uses granular FR numbering (FR1–FR16). This document consolidates them into 10 functional requirements. The table below provides the mapping for traceability.

| Epic FR | PRD FR(s) | Description |
|---------|-----------|-------------|
| FR1 | PRD FR1, FR2 | Google Sign-In + strict allowlist |
| FR2 | PRD FR8 | Raw Data Form with Enum dropdowns and +/- toggle |
| FR3 | PRD FR10 | Single Receipt OCR (Smart Scan) via Gemini |
| FR4 | PRD FR12 | ABA Digital Receipt Share Intent |
| FR5 | PRD FR11 | Batch Statement OCR |
| FR6 | PRD FR9 | Dashboard Widgets (Pie, YoY, Bar, Trend, Net save) |
| FR7 | PRD FR6 | Global advanced filtering |
| FR8 | PRD FR7 | Navigation Tabs |
| FR9 | PRD FR14, FR15 | Notifications + configurable settings |
| FR10 | PRD FR13 | 2-Way Excel Sync (Deferred) |
| — | PRD FR3 | AppSheet UI parity (cross-cutting, AR1) |
| — | PRD FR4, FR5 | Offline indicator + offline usage (cross-cutting, NFR1) |
| — | PRD FR16 | Core Architecture (cross-cutting, Story 1.1) |

## FR Coverage Map & Epic List

### FR Coverage Map

- **FR1:** Epic 1 - Authentication via Google Sign-In with strict allowlist
- **FR2:** Epic 2 - Manual Data Entry with AppSheet UI parity
- **FR3:** Epic 4 - Single Receipt OCR (Smart Scan)
- **FR4:** Epic 4 - Android OS native Share Intent for receipts
- **FR5:** Epic 4 - Batch Statement OCR
- **FR6:** Epic 3 - Dashboard widgets mirroring existing AppSheet charts
- **FR7:** Epic 3 - Global advanced filtering
- **FR8:** Epic 1 - Core Navigation (Transactions, Dashboard, Add, Account, By Month)
- **FR9:** Epic 5 - Local push notification reminders
- **FR10:** Epic 6 - Two-way real-time data sync with Excel (Deferred)

## Epic List

### Epic 1: Secure Access & Core Navigation
Users can securely log into the application using their approved Google accounts and navigate through the main sections of the app.
**FRs covered:** FR1, FR8

### Epic 2: Manual Transaction Management
Users can view their transaction history and manually add new transactions using a familiar interface that mimics their previous AppSheet experience, even when offline.
**FRs covered:** FR2

### Epic 3: Financial Insights & Reporting
Users can visualize their financial data through comprehensive dashboard charts and filter their data globally to analyze specific accounts, sources, or time periods.
**FRs covered:** FR6, FR7

### Epic 4: AI-Powered Data Entry Automation
Users can automate transaction entry by scanning receipts with AI, sharing digital receipts directly from their banking app (like ABA), or uploading batch statements to save time.
**FRs covered:** FR3, FR4, FR5

### Epic 5: Reminders & Settings
Users receive timely reminders to review their monthly financial summaries, helping them stay on top of their finances.
**FRs covered:** FR9

### Epic 6: Legacy System Synchronization (Deferred Feature)
Users have their data seamlessly synchronized with the legacy Excel spreadsheet to maintain a central source of truth across platforms.
**FRs covered:** FR10

## Epic 1: Secure Access & Core Navigation

Users can securely log into the application using their approved Google accounts and navigate through the main sections of the app.

### Story 1.1: Project Initialization & Secure Foundation

As a user,
I want the FinTrack app to be set up with a secure, modern foundation,
So that I can begin using a reliable and well-structured application from day one.

**Acceptance Criteria:**

**Given** a completely new Flutter environment cleanly isolated from the legacy Angular prototype
**When** the project is initialized using `flutter create`
**Then** the directory structure must follow a feature-first approach
**And** core dependencies like Riverpod, GoRouter, `freezed`, and Firebase core must be installed
**And** the app must compile and launch successfully on an Android device/emulator displaying a placeholder home screen

### Story 1.2: Google Sign-in & Authentication State

As a primary user,
I want to sign in to the app using my Google account,
So that my identity is verified securely without needing a separate password.

**Acceptance Criteria:**

**Given** I am an unauthenticated user opening the app
**When** I tap the "Sign in with Google" button and select my account
**Then** I should be authenticated via Firebase Auth
**And** I should be redirected to the main Dashboard screen

**Given** I am a logged-in user
**When** I reopen the app later
**Then** my session should persist and I should bypass the login screen

### Story 1.3: Enforce Strict User Allowlist

As a system owner,
I want to restrict access to only my account and my wife's account,
So that my personal financial data remains private and secure.

**Acceptance Criteria:**

**Given** I am a user trying to log in with an unauthorized Google account
**When** the authentication flow completes
**Then** the app should check my email against the strict allowlist
**And** I should be automatically signed out and shown an "Unauthorized Access" error message
**And** I should not be able to navigate past the login screen

### Story 1.4: Core App Navigation Shell

As a user,
I want a bottom or top navigation bar with specific tabs (Transactions, Dashboard, Add, Account, By Month),
So that I can easily move between the main features of the app just like I did in AppSheet.

**Acceptance Criteria:**

**Given** I am an authenticated user on any main screen
**When** I look at the navigation bar
**Then** I should see explicitly labeled tabs for: Transactions, Dashboard, Add, Account, By Month
**And** tapping a tab should instantly route me to the corresponding placeholder screen using Riverpod state for GoRouter navigation

## Epic 2: Manual Transaction Management

Users can view their transaction history and manually add new transactions using a familiar interface that mimics their previous AppSheet experience, even when offline.

### Story 2.1: Transaction Data Layer & Offline Readiness

As a user,
I want my transactions to be stored reliably and available even when I'm offline,
So that I never lose data regardless of my internet connection.

**Acceptance Criteria:**

**Given** the app is initializing
**When** Firebase Firestore is configured
**Then** offline persistence must be explicitly enabled
**And** a `Transaction` data model must exist using `freezed` supporting the fields: Amount, Description, Category, Date, Type, Account, and Source

**Given** the device has no internet connection
**When** a transaction is created or read
**Then** the operation must succeed using the local Firestore cache without errors

### Story 2.2: Add Transaction Form (AppSheet Parity)

As a secondary user,
I want an "Add Transaction" form that looks and behaves exactly like the legacy AppSheet app,
So that I don't have to learn a new interface.

**Acceptance Criteria:**

**Given** I am on the "Add" tab
**When** I view the form
**Then** I should see strict Enum-based dropdowns for `Accounts` and `Sources`
**And** I should see an explicit Add/Minus (+/-) toggle for the Amount to dictate Income vs Expense
**And** submitting the form should safely save the record to Firestore (queueing it if offline)

**Given** I submit the form with missing required fields
**When** validation runs
**Then** I should see inline error messages on the invalid fields and the form should not submit

**Given** the form submission fails due to a Firestore error (while online)
**When** the error occurs
**Then** I should see a SnackBar with a user-friendly error message and have the option to retry

### Story 2.3: Transaction List & Offline Indicator

As a user,
I want to see a scrollable list of my recent transactions grouped by date, and a visual indicator if I am offline,
So that I can review my activity and know if data is pending synchronization.

**Acceptance Criteria:**

**Given** I am on the "Transactions" tab
**When** I view the screen
**Then** I should see a list of transactions fetched from Firestore, grouped and sorted by Date (matching the AppSheet UI)
**And** if my device loses internet connectivity, a non-intrusive red counter/indicator must appear in the top app bar showing the number of pending offline writes

### Story 2.4: Account Summary View

As a user,
I want a dedicated Account tab showing my account balances and transaction breakdowns per account,
So that I can quickly see how much money is in each of my accounts.

**Acceptance Criteria:**

**Given** I tap the "Account" tab in the bottom navigation
**When** the screen loads
**Then** I should see a list of all accounts with their current balance (sum of Income - Expense)
**And** tapping an account should show a filtered transaction list for that specific account
**And** the layout should reference the Account view seen in the AppSheet UI reference screenshots

**Given** I have no transactions for a particular account
**When** I view the Account tab
**Then** that account should still appear with a balance of $0

## Epic 3: Financial Insights & Reporting

Users can visualize their financial data through comprehensive dashboard charts and filter their data globally to analyze specific accounts, sources, or time periods.

### Story 3.1: Global Filter State Management

As a user,
I want a global filter panel that I can access from anywhere,
So that I can filter my view by Account, Date Range, Source, Month, or Year.

**Acceptance Criteria:**

**Given** I am viewing the Transactions or Dashboard tab
**When** I open the global filter modal from the app bar
**Then** I should see selectors for Account, Date Range, Source, Month, and Year
**And** applying a filter must instantly update a Riverpod global state provider
**And** both the Transaction List and all Dashboard widgets must seamlessly react to this state change

### Story 3.2: Earn & Expense Pie Charts

As a user,
I want to see pie charts for my Earnings and Expenses natively adapting to my global filters,
So that I can quickly grasp my cash flow distribution.

**Acceptance Criteria:**

**Given** I am on the Dashboard tab
**When** I view the charts section
**Then** I should see "Earn last N months" and "Expense last N months" pie charts built with `fl_chart`
**And** the charts must exactly mirror the layout of the AppSheet screenshots (matching colors and legends)
**And** the data displayed must react instantly to the Global Filter State

### Story 3.3: By Account & Trend Line Charts

As a user,
I want to see my balances by Account and a long-term Trend line chart,
So that I can monitor my overall asset accumulation and account health over time.

**Acceptance Criteria:**

**Given** I am on the Dashboard tab
**When** I scroll down
**Then** I should see a "By Account" horizontal bar chart, a "YoY Comparison" chart, and a "Trend Earning" line chart
**And** the YoY Comparison chart must show side-by-side comparison of current vs previous year earnings and expenses
**And** these charts must be built using `fl_chart` to match the AppSheet reference images
**And** the data must dynamically react to the Global Filter State

**Given** I have no transaction data for the selected filter period
**When** I view the charts
**Then** I should see an empty state message (e.g., "No data for this period") instead of blank charts

### Story 3.4: "By Month" Rollup View

As a user,
I want a dedicated tab summarizing my data by Month,
So that I can see a high-level list of my monthly net savings/spending.

**Acceptance Criteria:**

**Given** I tap the "By Month" tab in the bottom navigation
**When** the screen loads
**Then** I should see a grouped list showing aggregated sums (Income - Expense) per month
**And** the layout should match the nested list view seen in the AppSheet UI reference screenshots

## Epic 4: AI-Powered Data Entry Automation

Users can automate transaction entry by scanning receipts with AI, sharing digital receipts directly from their banking app (like ABA), or uploading batch statements to save time.

### Story 4.1: Gemini AI Service & Receipt Processing Foundation

As a user,
I want the app to have AI-powered receipt reading capability,
So that I can scan receipts and have transactions auto-filled instead of typing manually.

**Acceptance Criteria:**

**Given** the app is compiling
**When** the Gemini service is initialized
**Then** it must securely load the API key from environment variables (e.g., `flutter_dotenv`)
**And** it must successfully instantiate the `GenerativeModel` targeting `gemini-1.5-flash`

**Given** the API key is missing or invalid
**When** the Gemini service attempts to initialize
**Then** the app must log the error and gracefully disable AI features without crashing
**And** manual transaction entry must remain fully functional

### Story 4.2: Single Receipt OCR (Smart Scan)

As a primary user,
I want to upload or take a picture of a receipt,
So that the AI can automatically extract the transaction details and pre-fill the Add Transaction form.

**UX Flow:** User taps "Smart Scan" → Camera/Gallery picker → Loading spinner with "Analyzing receipt..." → Pre-filled Add Transaction form → User reviews and confirms → Transaction saved.

**Acceptance Criteria:**

**Given** I am on the Dashboard or Transactions tab
**When** I tap the "Smart Scan" action and select an image
**Then** the image must be sent to the Gemini service with instructions to extract specific transaction fields
**And** a loading indicator with "Analyzing receipt..." must be displayed during processing
**And** upon successful parsing, I must be routed to the "Add Transaction" form with all extracted fields pre-filled for my final review

**Given** the Gemini API fails to parse the image or returns an error
**When** the OCR processing completes with failure
**Then** I should see a user-friendly error message (e.g., "Could not read receipt. Please try again or enter manually.")
**And** I should be offered options to retry or switch to manual entry

**Given** the Gemini API returns only partial fields (e.g., Amount but no Category)
**When** the pre-filled form is displayed
**Then** the successfully extracted fields must be pre-filled and the missing fields left empty for manual input

### Story 4.3: ABA Digital Receipt Native Share Intent

As a primary user,
I want to share a digital receipt directly from my ABA banking app to FinTrack,
So that I can log a transaction without even opening FinTrack manually first.

**UX Flow:** User taps Share in banking app → Selects "FinTrack V2" → App launches with loading overlay → OCR processes automatically → Pre-filled Add Transaction form → User confirms.

**Acceptance Criteria:**

**Given** I am in my banking app looking at a digital receipt image
**When** I tap "Share" and select "FinTrack V2" from the native Android OS share sheet
**Then** FinTrack must launch and immediately process the shared image via the Gemini OCR service
**And** I must be presented directly with the pre-filled "Add Transaction" form

**Given** the shared image is not a valid receipt or cannot be processed
**When** the OCR fails
**Then** I should see an error message and be offered manual entry as a fallback

### Story 4.4: Batch Statement AI Extraction

As a primary user,
I want to upload an image of a bank statement,
So that the AI can extract multiple transactions at once for me to review and save.

**UX Flow:** User taps "Batch Upload" → Camera/Gallery picker → Loading spinner with "Extracting transactions..." → Staging list view of extracted transactions → User reviews, edits, or deletes individual entries → "Save All" → Batch write to Firestore.

**Acceptance Criteria:**

**Given** I select the "Batch Upload" feature
**When** I provide a multi-transaction image to Gemini
**Then** the service must return a JSON array of parsed transactions
**And** I must see a temporary staging view where I can delete or adjust these entries before triggering a batch write to Firestore

**Given** the Gemini API can only partially extract transactions from the statement
**When** the staging view is displayed
**Then** successfully extracted transactions should be shown with a count (e.g., "5 of estimated 8 transactions extracted")
**And** I should be able to manually add missing transactions

**Given** the Gemini API fails completely
**When** the processing completes with error
**Then** I should see an error message and be offered the option to retry or enter transactions manually

## Epic 5: Reminders & Settings

Users receive timely reminders to review their monthly financial summaries, helping them stay on top of their finances.

### Story 5.1: Local Push Notification Reminders

As a system owner,
I want the app to send a local push notification on a specific day every month,
So that I remember to review our overall financial health.

**Acceptance Criteria:**

**Given** I have granted notification permissions
**When** the scheduled day of the month arrives
**Then** the app must trigger a push notification locally without needing a backend server
**And** tapping the notification should open the app to the "By Month" tab

### Story 5.2: Settings & Preferences View

As a user,
I want a Settings screen where I can adjust my preferences,
So that I can control when my monthly reminders trigger.

**Acceptance Criteria:**

**Given** I am in the app
**When** I navigate to the Settings view
**Then** I should see a preference for "Monthly Reminder Date" (default: 28th)
**And** changing this value must immediately update the local notification schedule from Story 5.1

## Epic 6: Legacy System Synchronization (Deferred Feature)

Users have their data seamlessly synchronized with the legacy Excel spreadsheet to maintain a central source of truth across platforms.

### Story 6.1: MS Graph API Integration & 2-Way Sync Engine

As a user,
I want my transaction data to stay in sync between the FinTrack app and the family Excel spreadsheet,
So that both platforms always reflect the latest financial records.

**Acceptance Criteria:**

**Given** the experimental 2-way sync feature is enabled
**When** a transaction is written to Firestore
**Then** the sync engine must enqueue a request to append a row to the family Excel sheet via MS Graph API
**And** it must periodically poll the Excel sheet for novel rows to conditionally insert into Firestore

**Given** a sync conflict occurs (same transaction modified in both Firestore and Excel)
**When** the sync engine detects the conflict
**Then** it must apply a last-write-wins strategy using timestamps and log the conflict for review

**Given** the MS Graph API is unreachable or returns an error
**When** a sync attempt fails
**Then** the failed operation must be queued for automatic retry with exponential backoff
**And** the user must not lose any local data
