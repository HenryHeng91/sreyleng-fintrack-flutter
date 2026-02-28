---
title: "FinTrack V2 (Flutter) - Product Requirements Document"
status: "Draft"
last_updated: "2026-02-28"
---

# FinTrack V2 (Flutter) - Product Requirements Document

## 1. Overview & Problem Statement
The goal is to rebuild the FinTrack application using **Flutter and Firebase**. The app will replace an existing AppSheet + Excel solution and an experimental Angular web app. 
The core problem with the existing AppSheet version is the friction of manual data entry. The goal of FinTrack V2 is to completely automate transaction entry via AI-powered OCR and native OS integrations, while retaining the exact UI layout and familiarity of the AppSheet version to prevent a learning curve for secondary users.

## 2. Target Audience
- **Primary User (Developer)**: Requires deep automation, AI receipt scanning, native Android share intents, and advanced data visualization.
- **Secondary User (Wife)**: Requires a highly familiar, simple, and reliable interface for manual transaction entry, mirroring the legacy AppSheet layout.

## 3. Core Architecture
- **Frontend**: Flutter (Mobile-first, compiling to Android APK).
- **Backend & Database**: Firebase Firestore (NoSQL). Chosen for its out-of-the-box real-time synchronization between multiple devices and robust offline persistence capabilities.
- **Authentication**: Firebase Auth (Google Sign-In). 

## 4. Functional Requirements

### 4.1 Authentication & Security
- The app must enforce Google Sign-in.
- **Strict Allowlist**: Only predefined Google accounts (the developer and his wife) are permitted to log in. Any other Google account must be rejected at the authentication layer.

### 4.2 UI/UX Parity (AppSheet Inspiration)
- The layout must closely mimic the provided AppSheet screenshots to ensure zero learning curve.
- **Offline Indicator**: If the device loses internet connection, a non-intrusive red counter/indicator must appear in the top right, showing the number of transactions pending sync to the server. The user must be able to continue adding transactions seamlessly while offline.
- **Global Filtering**: A global filter panel (accessible from the top) must be implemented. Applying a filter (e.g., by Account, Date, Source, Month, Year) must filter *both* the transaction list and all Dashboard widgets simultaneously.
- **Navigation Tabs**: The bottom or top navigation must explicitly include the following tabs: Transactions, Dashboard, Add, **Account**, and **By Month** (matching the AppSheet structure).
- **Raw Data Form**: Must include strict Enum dropdowns for Accounts and Sources, and an Add/Minus toggle for Amount.
- **Dashboard Widgets**: Recreate AppSheet charts exactly: Earn/Expense Pie charts, YoY comparisons, By Account bar chart, Trend Earning line chart, and Net save list.

### 4.3 AI & Automation (The "Magic" Features)
- **Single Receipt OCR (Smart Scan)**: Integrate the Google Gemini API (`gemini-1.5-flash`) to analyze receipt images and extract Amount, Description, Category, Date, Type, Account, and Source.
- **Batch Statement OCR**: Allow uploading a credit card statement image to extract a batch of transactions (Amount, Description, Category, Date, Type) for bulk preview and confirmation.
- **ABA Digital Receipt Sharing**: Register the app as a target in the Android Share Sheet. Sharing an ABA receipt to FinTrack must instantly trigger the OCR and open the pre-filled Raw Data Form.

### 4.4 Data Migration & 2-Way Sync
- **Real-time Excel/AppSheet Sync**: The new Flutter app must synchronize data in real-time (two-way) with the existing `Family Saving and Expense.xlsx` file. If the secondary user adds a transaction via the old AppSheet app, it must appear immediately in the Flutter app, and vice versa. This requires a robust backend sync mechanism bridging Firestore and the Microsoft Graph API.

### 4.5 Notifications
- **Monthly Summary Reminder**: Implement a locally scheduled push notification that fires on a specific day of the month (default: the 28th) reminding the user to review their monthly financial summary.
- The trigger date and report date-range must be configurable within an in-app Settings view.

## 5. Non-Functional Requirements
- **Offline First**: The app must be fully functional without an internet connection. Read and write operations must queue locally and automatically sync to Firestore when the connection is restored.
- **Cost**: Infrastructure footprint must consciously target 100% free tiers (Google AI Studio Free Tier, Firebase Spark Plan).
- **Separation of Concerns**: The Flutter codebase must be initialized in a completely separate directory from the existing Angular prototype.
