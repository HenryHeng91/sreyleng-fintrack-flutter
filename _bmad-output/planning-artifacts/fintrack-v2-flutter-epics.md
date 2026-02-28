---
title: "FinTrack V2 (Flutter) - Epics & User Stories"
status: "Draft"
last_updated: "2026-02-28"
---

# FinTrack V2 (Flutter) - Epics & User Stories

## Epic 1: Project Initialization & Core Architecture
*Objective: Establish the foundational Flutter project and Firebase infrastructure alongside the existing Angular code.*
- **Story 1.1**: Initialize a new Flutter project in a new directory (`fintrack_flutter`) to ensure the existing Angular codebase remains untouched.
- **Story 1.2**: Create a Firebase Project, register the Android application, and integrate `firebase_core` and `cloud_firestore` dependencies.
- **Story 1.3**: Configure native Android build settings (package name, SDK versions, signing config) to support easy APK generation and manual distribution.

## Epic 2: Authentication & Access Control
*Objective: Secure the app using Google Sign-in, restricted exclusively to authorized users.*
- **Story 2.1**: Integrate the `google_sign_in` and `firebase_auth` packages to allow users to authenticate via their Google accounts.
- **Story 2.2**: Implement an authentication interceptor that checks the authenticated email against a hardcoded/Firestore-backed allowlist. Reject unauthorized logins and sign them out immediately.

## Epic 3: Database Models & 2-Way Data Sync
*Objective: Define the data structure and establish real-time synchronization with the legacy AppSheet Excel file.*
- **Story 3.1**: Define Dart data models (with `toJson`/`fromJson` serialization) for `Transaction`, `Account`, and `Category` matching the requirements of the AppSheet legacy system.
- **Story 3.2**: Configure Firestore offline persistence so the app can read/write data without a network connection. Queue local writes to push when back online.
- **Story 3.3**: Develop a Backend Sync Worker (e.g., Firebase Cloud Functions or Node.js running Microsoft Graph API) that establishes a **real-time, two-way sync** between the new Firestore database and the `Family Saving and Expense.xlsx` file. Changes in AppSheet must instantly reflect in Flutter, and vice versa.

## Epic 4: UI Foundation & AppSheet Parity
*Objective: Recreate the familiar interface required by the secondary user.*
- **Story 4.1**: Build the main application shell with a bottom/top navigation bar containing exactly 5 tabs: **Transactions, Dashboard, Add, Account, and By Month**.
- **Story 4.2**: Implement a global filter panel (accessible from the top bar) allowing filtering by Account, Date, Source, Entry Date, Month, and Year. This filter must globally apply to both the Transaction List and all Dashboard widgets.
- **Story 4.3**: Implement the "Raw Data Form" (Add/Edit Transaction), ensuring the exact Enums for Accounts and Sources are used in the UI dropdowns, matching the AppSheet layout.
- **Story 4.4**: Implement the Transaction List view, showing grouped transactions by date with swipe-to-delete functionality.
- **Story 4.5**: Integrate a charting library (e.g., `fl_chart`) and strictly build the AppSheet Dashboard widgets: Earn/Expense Pie charts (last 4 months), YoY Earn/Expense charts, By Account bar chart, Trend Earning line chart, and Net save summary list.
- **Story 4.6**: Implement an **Offline Sync Indicator**: A non-intrusive red counter in the top right corner that appears only when offline, displaying the number of transactions queued locally. The app must allow seamless transaction entry while this is active.

## Epic 5: AI OCR & Native OS Integrations (The "Magic")
*Objective: Automate transaction entry using Android APIs and Google Gemini, porting all AI Studio features.*
- **Story 5.1 (Smart Scan)**: Integrate the Google Gen AI SDK. Write a service that accepts a single image file (e.g., a paper receipt), sends it to `gemini-1.5-flash`, and parses the JSON response into a single `Transaction` object.
- **Story 5.2 (Statement OCR)**: Implement batch processing logic where a user can upload a credit card statement. The AI must extract multiple transactions into a list, allowing the user to preview and 'Confirm All'.
- **Story 5.3**: Implement the `receive_sharing_intent` package. Configure the Android Manifest so FinTrack appears in the OS "Share" menu for images.
- **Story 5.4**: Wire the Android sharing intent to the Smart Scan OCR service: When an ABA receipt is shared to the app, automatically run the OCR and route the user to the "Raw Data Form" heavily pre-filled.

## Epic 6: Notifications & Settings
*Objective: Provide proactive reminders for financial reviews.*
- **Story 6.1**: Integrate `flutter_local_notifications` to schedule recurring, offline, on-device push notifications.
- **Story 6.2**: Build a Settings screen allowing the user to configure the exact day of the month the summary notification should fire (defaulting to the 28th).
