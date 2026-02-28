---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - fintrack-v2-flutter-prd.md
  - fintrack-v2-flutter-epics.md
workflowType: 'architecture'
project_name: 'sreyleng-fintrack-flutter'
user_name: 'HengSiekhai'
date: '2026-03-01T00:15:46+07:00'
lastStep: 8
status: 'complete'
completedAt: '2026-03-01T00:15:46+07:00'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

| Category | Key Requirements | Architectural Impact |
|----------|-----------------|---------------------|
| **Authentication & Security** | Google Sign-In with strict 2-user allowlist | Simple auth layer, Firestore rules or client-side gating |
| **UI/UX Parity** | 5-tab navigation, global filters, AppSheet-matching charts, offline indicator | Constrains widget hierarchy, requires global state for filters |
| **AI & Automation** | Single receipt OCR, batch statement OCR, ABA share intent | Gemini API service layer, image pipeline, Android manifest config |
| **Data Sync** | Real-time 2-way sync between Firestore and Excel via MS Graph API | Backend sync worker (Cloud Functions/Node.js), conflict resolution |
| **Notifications** | Locally scheduled monthly summary reminders | `flutter_local_notifications`, settings persistence |

**Non-Functional Requirements:**

- **Offline-First**: Full read/write capability without internet; local queue with automatic sync on reconnect. This is the single most impactful NFR — it shapes the entire data access layer.
- **Cost: 100% Free Tier**: Firebase Spark Plan + Google AI Studio Free Tier. Eliminates paid Cloud Functions, Cloud Run, or premium API tiers.
- **Separation of Concerns**: Flutter codebase must be isolated from existing Angular prototype.

**Scale & Complexity:**

- Primary domain: **Mobile (Flutter/Android) + Backend Services (Firebase)**
- Complexity level: **Medium-High**
- Estimated architectural components: **8-10** (Auth, Data Models, Firestore Repository, Sync Worker, AI/OCR Service, UI Shell, Global Filter State, Notification Service)

### Technical Constraints & Dependencies

| Constraint | Impact |
|-----------|--------|
| Firebase Spark Plan (free tier) | No paid Cloud Functions invocations; limits on Firestore reads/writes per day; no outbound networking from Cloud Functions |
| Google AI Studio Free Tier | Rate limits on Gemini API calls; must handle throttling gracefully |
| Android-only deployment | No iOS considerations; can leverage Android-specific APIs freely (Share Intents, APK distribution) |
| 2 users only | No scalability concerns; simplifies auth, data partitioning, and conflict resolution |
| AppSheet UI parity | UI architecture must support exact recreation of AppSheet layout; limits creative UI freedom |
| Microsoft Graph API for Excel sync | Requires OAuth2 service credentials; external dependency with its own rate limits and API constraints |

### Cross-Cutting Concerns Identified

1. **Offline Handling** — Every data operation must work offline. Affects repository pattern, state management, UI feedback (sync indicator), and error handling strategies.
2. **Global Filtering** — A single filter state must propagate across Transaction List and all Dashboard chart widgets simultaneously. Requires a centralized, reactive filter state mechanism.
3. **AI Response Validation** — OCR results from Gemini are probabilistic. Needs validation, default fallbacks, and user confirmation flow across both single-scan and batch-scan entry points.
4. **Sync Conflict Resolution** — Bidirectional Firestore ↔ Excel sync introduces potential conflicts (e.g., same transaction edited in AppSheet and Flutter simultaneously). Requires a deterministic conflict strategy (e.g., last-write-wins with timestamps).
5. **Error Propagation** — API failures (Gemini, MS Graph, Firebase) need consistent error handling and user-facing feedback across all features.

## Starter Template Evaluation

### Primary Technology Domain

**Mobile App (Flutter/Android)** with **Firebase Backend Services** — identified from project requirements analysis.

### Starter Options Considered

| Option | Description | Verdict |
|--------|-------------|---------|
| `flutter create` (standard) | Official Flutter CLI scaffold | ✅ **Selected** — Right-sized, flexible, Flutter 3.41 compatible |
| Very Good CLI (v0.28.0) | Production-ready template by VGV | ❌ Overkill — Bloc-opinionated, enterprise patterns add overhead for 2-user app |
| `flutter create --empty` | Minimal scaffold | ❌ Too minimal — need at least Material scaffolding |

### Selected Starter: `flutter create` (Standard)

**Rationale:**
- Right-sized for a 2-user personal app (no enterprise scaffolding overhead)
- Doesn't lock into Bloc — allows Riverpod as state management choice
- Feature-first Clean Architecture will be manually established, tailored to specific features
- Flutter 3.41 (Feb 2026) compatible with latest Dart features and Impeller rendering

**Initialization Command:**

```bash
flutter create --org com.hengsiekhai --project-name sreyleng_fintrack --platforms android --empty ./
```

**Architectural Decisions Provided by Starter:**

| Decision Area | What Starter Provides |
|--------------|----------------------|
| Language & Runtime | Dart (latest stable), null safety enabled |
| Styling Solution | Material Design 3 (default Flutter theme system) |
| Build Tooling | Gradle (Android), `flutter build apk` |
| Testing Framework | `flutter_test` (widget + unit tests) |
| Code Organization | Minimal `lib/main.dart` — feature-first structure established manually |
| Dev Experience | Hot reload, DevTools, Dart Analysis |

**Decisions Deferred to Step 4:**
- State Management → Riverpod (recommended)
- Project Structure → Feature-first Clean Architecture
- Routing → `go_router`
- Serialization → `json_serializable` + `freezed`
- Charts → `fl_chart`

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- State management approach (Riverpod)
- Data modeling strategy (Freezed + json_serializable)
- Offline-first strategy (Firestore built-in persistence)
- Authentication & allowlist enforcement

**Important Decisions (Shape Architecture):**
- Routing approach (GoRouter)
- AI/OCR service integration pattern
- Global filter state propagation
- Error handling strategy

**Deferred Decisions (Post-MVP):**
- ~~Excel 2-Way Sync~~ — **Deferred.** Firebase Spark Plan blocks outbound networking from Cloud Functions (MS Graph API calls would fail). Full migration to Firestore is the chosen path. Excel sync may be revisited post-MVP if Blaze Plan is adopted.

### Data Architecture

| Decision | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| Database | Firebase Firestore | Latest | Real-time sync, offline persistence built-in, NoSQL document model |
| Data Models | `freezed` + `json_serializable` | 3.2.3 / 6.13.0 | Immutable models, `copyWith`, union types, auto-generated serialization |
| Offline Strategy | Firestore built-in persistence | — | `Settings(persistenceEnabled: true)` — no custom offline queue needed |
| Caching | Firestore local cache | — | Firestore handles read caching automatically when offline |

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth Provider | Firebase Auth (Google Sign-In) | PRD requirement, free tier |
| Allowlist Enforcement | Client-side check **+** Firestore Security Rules | Double layer: client rejects non-allowlisted emails, Firestore rules enforce at DB level |
| Security Rules | Firestore rules restrict read/write to allowlisted UIDs | Only 2 authorized users; rules match against UID list |

### API & Communication Patterns

| Decision | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| Gemini API Client | `google_generative_ai` (official Dart SDK) | Latest | Direct client-side API calls; no backend proxy needed |
| HTTP Client | `dio` | Latest | Interceptors for error handling, retry logic, request/response logging |
| Error Handling | Result pattern via `freezed` union types | — | Type-safe `Success`/`Failure` without exceptions; consistent across all services |

### Frontend Architecture

| Decision | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| State Management | **Riverpod** | `flutter_riverpod` 3.2.1 | Compile-time safety, no `BuildContext` dependency, fine-grained rebuilds, lower boilerplate than Bloc |
| Routing | **GoRouter** | `go_router` 17.1.0 | Declarative URL-based routing, deep linking, `ShellRoute` for tab navigation |
| Charts | **fl_chart** | 1.1.1 | Highly customizable; supports Pie, Bar, Line charts matching AppSheet dashboard |
| Project Structure | Feature-first Clean Architecture | — | Features: `auth`, `transactions`, `dashboard`, `ocr`, `settings`, `notifications` |
| UI Framework | Material Design 3 | Flutter built-in | Consistent with AppSheet aesthetic; Material widgets for forms, navigation, filters |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Firebase Plan | **Spark (Free)** | 2-user app; well within free tier limits |
| CI/CD | Manual `flutter build apk` | No CI/CD pipeline needed for 2-user manual APK distribution |
| Crash Reporting | Firebase Crashlytics (free) | Automatic crash reporting, stack traces |
| Env Config | `flutter_dotenv` | `.env` files for API keys, Firebase config |
| Monitoring | Firebase Analytics (free) | Basic usage analytics |

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (`flutter create`) + Firebase setup (`flutterfire configure`)
2. Auth layer (Firebase Auth + Google Sign-In + allowlist)
3. Data models (`freezed` + Firestore repository)
4. UI shell + routing (GoRouter + 5-tab navigation)
5. Transaction CRUD + offline indicator
6. Dashboard + charts (`fl_chart`)
7. Global filter state (Riverpod)
8. OCR integration (Gemini API)
9. Android Share Intent (ABA receipts)
10. Notifications (`flutter_local_notifications`)

**Cross-Component Dependencies:**
- Riverpod providers are the glue — auth state, filter state, transaction data, and OCR results all flow through Riverpod
- GoRouter guards depend on auth state provider
- Dashboard widgets depend on both transaction data and global filter state
- OCR service feeds into the same transaction form/model used by manual entry

## Implementation Patterns & Consistency Rules

### Naming Patterns

| Area | Convention | Example |
|------|-----------|--------|
| Dart files | `snake_case.dart` | `transaction_repository.dart` |
| Classes | `PascalCase` | `TransactionRepository` |
| Functions/variables | `camelCase` | `getTransactions()`, `transactionList` |
| Constants | `camelCase` | `defaultPageSize` |
| Riverpod providers | `camelCase` + `Provider` suffix | `transactionListProvider`, `authStateProvider` |
| Firestore collections | `snake_case` plural | `transactions`, `accounts` |
| Firestore fields | `camelCase` | `entryDate`, `accountName` |
| Feature folders | `snake_case` | `lib/features/transactions/` |
| Widget files | `snake_case` matching class | `transaction_list_tile.dart` → `TransactionListTile` |

### Structure Patterns

**Feature-first Clean Architecture layout:**

```
lib/
├── app/                    # App-level: routing, theme, main widget
├── core/                   # Shared: constants, utils, extensions, error types
├── features/
│   ├── auth/
│   │   ├── data/           # Repositories, data sources
│   │   ├── domain/         # Models (freezed), business logic
│   │   └── presentation/   # Screens, widgets, providers
│   ├── transactions/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── dashboard/
│   ├── ocr/
│   ├── settings/
│   └── notifications/
└── shared/                 # Shared widgets, theme data
```

**Test files:** Co-located in `test/` mirroring `lib/` structure.

### Format Patterns

| Area | Convention |
|------|----------|
| Dates in Firestore | `Timestamp` (Firestore native) |
| Dates in Dart models | `DateTime` (converted via serializer) |
| Dates in UI | Formatted via `intl` package (`DateFormat`) |
| JSON field naming | `camelCase` (Dart default, matches Firestore) |
| Null handling | Nullable types (`String?`); never use empty strings as null substitute |
| Currency amounts | `double` (matches existing Excel data format) |

### State Management Patterns (Riverpod)

| Pattern | Convention |
|---------|----------|
| Provider organization | One `providers.dart` file per feature |
| State classes | `freezed` unions: `Initial`, `Loading`, `Loaded`, `Error` |
| Async data | Use Riverpod's built-in `AsyncValue<T>` |
| State mutations | Via `AsyncNotifier` or `Notifier` subclasses |
| Global filter state | Single `filterProvider` in `core/`, consumed by transactions + dashboard |

### Error Handling Patterns

| Pattern | Convention |
|---------|----------|
| Service errors | Return `AsyncValue.error()` or `freezed` Result type |
| User-facing errors | SnackBar with human-readable message |
| Logging | `dart:developer` `log()` for debug; Crashlytics for production |
| API failures | Retry with exponential backoff via `dio` interceptor |
| Form validation | Inline validation on form fields; validate before submit |

### Loading State Patterns

| Pattern | Convention |
|---------|----------|
| Screen-level loading | `AsyncValue.when(loading: ..., data: ..., error: ...)` |
| Button loading | Disable button + show `CircularProgressIndicator` |
| Pull-to-refresh | `RefreshIndicator` on list views |
| Skeleton loading | For dashboard charts on initial load |

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow Dart/Flutter naming conventions (`snake_case` files, `PascalCase` classes, `camelCase` variables)
- Use `freezed` for all data models — no hand-written `toJson`/`fromJson`
- Place all feature code within its `data/domain/presentation` subdirectories
- Use `AsyncValue` for all async state in Riverpod providers
- Handle errors via Result pattern or `AsyncValue.error` — never swallow exceptions

## Project Structure & Boundaries

### Complete Project Directory Structure

```
sreyleng_fintrack/
├── README.md
├── pubspec.yaml
├── analysis_options.yaml
├── .env.example
├── .env                            # (gitignored)
├── .gitignore
├── android/
│   └── app/src/main/
│       └── AndroidManifest.xml      # Share intent filters
├── assets/
│   └── images/
├── lib/
│   ├── main.dart                    # Entry point, Firebase init, ProviderScope
│   ├── app/
│   │   ├── app.dart                 # MaterialApp + GoRouter
│   │   ├── router.dart              # Route definitions, auth guards
│   │   └── theme.dart               # Material 3 theme data
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_constants.dart    # Allowlisted emails, defaults
│   │   │   └── firestore_paths.dart  # Collection/doc path strings
│   │   ├── extensions/
│   │   │   ├── date_extensions.dart
│   │   │   └── string_extensions.dart
│   │   ├── providers/
│   │   │   └── filter_provider.dart  # Global filter state
│   │   ├── utils/
│   │   │   ├── date_utils.dart
│   │   │   └── currency_utils.dart
│   │   └── errors/
│   │       └── app_exception.dart    # Base exception types (freezed)
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   └── auth_repository.dart
│   │   │   ├── domain/
│   │   │   │   └── app_user.dart
│   │   │   └── presentation/
│   │   │       ├── providers/auth_provider.dart
│   │   │       └── screens/login_screen.dart
│   │   ├── transactions/
│   │   │   ├── data/
│   │   │   │   └── transaction_repository.dart
│   │   │   ├── domain/
│   │   │   │   ├── transaction.dart
│   │   │   │   ├── account.dart
│   │   │   │   └── source.dart
│   │   │   └── presentation/
│   │   │       ├── providers/transaction_providers.dart
│   │   │       ├── screens/
│   │   │       │   ├── transaction_list_screen.dart
│   │   │       │   ├── add_transaction_screen.dart
│   │   │       │   ├── account_screen.dart
│   │   │       │   └── by_month_screen.dart
│   │   │       └── widgets/
│   │   │           ├── transaction_list_tile.dart
│   │   │           ├── transaction_form.dart
│   │   │           └── offline_sync_indicator.dart
│   │   ├── dashboard/
│   │   │   ├── data/dashboard_repository.dart
│   │   │   ├── domain/chart_data.dart
│   │   │   └── presentation/
│   │   │       ├── providers/dashboard_providers.dart
│   │   │       ├── screens/dashboard_screen.dart
│   │   │       └── widgets/
│   │   │           ├── earn_expense_pie_chart.dart
│   │   │           ├── yoy_comparison_chart.dart
│   │   │           ├── by_account_bar_chart.dart
│   │   │           ├── trend_earning_line_chart.dart
│   │   │           └── net_save_summary.dart
│   │   ├── ocr/
│   │   │   ├── data/gemini_ocr_service.dart
│   │   │   ├── domain/ocr_result.dart
│   │   │   └── presentation/
│   │   │       ├── providers/ocr_providers.dart
│   │   │       ├── screens/
│   │   │       │   ├── smart_scan_screen.dart
│   │   │       │   └── batch_scan_screen.dart
│   │   │       └── widgets/ocr_preview_card.dart
│   │   ├── settings/
│   │   │   ├── data/settings_repository.dart
│   │   │   ├── domain/app_settings.dart
│   │   │   └── presentation/
│   │   │       ├── providers/settings_provider.dart
│   │   │       └── screens/settings_screen.dart
│   │   └── notifications/
│   │       ├── data/notification_service.dart
│   │       └── presentation/
│   │           └── providers/notification_provider.dart
│   └── shared/
│       ├── widgets/
│       │   ├── app_scaffold.dart         # Shell with bottom nav
│       │   ├── filter_panel.dart         # Global filter drawer
│       │   ├── loading_indicator.dart
│       │   └── error_widget.dart
│       └── theme/
│           ├── app_colors.dart
│           └── app_text_styles.dart
├── test/
│   ├── features/
│   │   ├── auth/
│   │   ├── transactions/
│   │   ├── dashboard/
│   │   └── ocr/
│   └── core/
└── firebase/
    ├── firestore.rules
    └── firestore.indexes.json
```

### Epic → Structure Mapping

| Epic | Primary Location | Key Files |
|------|-----------------|----------|
| Epic 1: Project Init | Root + `android/` | `pubspec.yaml`, `main.dart`, Firebase config |
| Epic 2: Auth | `features/auth/` | `auth_repository.dart`, `login_screen.dart`, `auth_provider.dart` |
| Epic 3: Data Models | `features/transactions/domain/` | `transaction.dart`, `account.dart`, `source.dart` |
| Epic 4: UI Foundation | `features/transactions/`, `features/dashboard/`, `shared/` | All screens, `app_scaffold.dart`, `filter_panel.dart`, chart widgets |
| Epic 5: AI OCR | `features/ocr/` | `gemini_ocr_service.dart`, `smart_scan_screen.dart`, `batch_scan_screen.dart` |
| Epic 6: Notifications | `features/notifications/`, `features/settings/` | `notification_service.dart`, `settings_screen.dart` |

### Architectural Boundaries

**Data Flow:** `Firestore` → `Repository` → `Riverpod Provider` → `Widget`

**Provider Dependency Graph:**
- `authStateProvider` → guards all routes
- `filterProvider` (core) → consumed by `transactionListProvider` + `dashboardProviders`
- `transactionRepositoryProvider` → consumed by transaction and dashboard features
- `ocrProvider` → produces `Transaction` objects → feeds into `addTransactionScreen`

**External Integration Points:**
- Firebase Auth SDK → `auth_repository.dart`
- Firestore SDK → all `*_repository.dart` files
- Gemini API → `gemini_ocr_service.dart`
- Android Share Intent → `AndroidManifest.xml` + `main.dart` intent handler
- Local Notifications → `notification_service.dart`

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- Flutter 3.41 + Dart latest ✅ compatible with all chosen packages
- `flutter_riverpod` 3.2.1 + `go_router` 17.1.0 + `freezed` 3.2.3 ✅ mutually compatible
- Firestore offline persistence + Riverpod `AsyncValue` ✅ complementary pattern
- Material Design 3 + `fl_chart` 1.1.1 ✅ no conflicts

**Pattern Consistency:** All naming, structure, and state patterns align with Dart/Flutter conventions. No contradictions found.

**Structure Alignment:** Feature-first folder layout fully supports Riverpod provider scoping and GoRouter shell routes.

### Requirements Coverage ✅

| Epic | Coverage | Notes |
|------|----------|-------|
| Epic 1: Project Init | ✅ | `flutter create` + `flutterfire configure` |
| Epic 2: Auth | ✅ | Firebase Auth + allowlist |
| Epic 3: Data Models | ✅ (modified) | `freezed` models, Firestore persistence. Excel sync deferred. |
| Epic 4: UI Foundation | ✅ | 5-tab nav, global filters, all charts, offline indicator |
| Epic 5: AI OCR | ✅ | Gemini service, Smart/Batch Scan, Share Intent |
| Epic 6: Notifications | ✅ | `flutter_local_notifications`, settings screen |

**NFR Coverage:**
- Offline-First ✅ Firestore built-in persistence
- Cost (Free Tier) ✅ Spark Plan + AI Studio free tier
- Separation of Concerns ✅ Isolated Flutter project

### Implementation Readiness ✅

| Criterion | Status |
|-----------|--------|
| All critical decisions documented with versions | ✅ |
| Implementation patterns comprehensive | ✅ |
| Consistency rules clear and enforceable | ✅ |
| Project structure complete and specific | ✅ |
| Epic-to-folder mapping defined | ✅ |
| Data flow and provider graph documented | ✅ |

### Gap Analysis

**No Critical Gaps.**

**Minor notes (non-blocking):**
- Firestore Security Rules exact syntax — defined during Epic 2 implementation
- Gemini API OCR prompt format — refined during Epic 5 implementation
- `intl` package for date formatting — implied by format patterns, add to dependencies during implementation

### Architecture Completeness Checklist

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] State management patterns specified
- [x] Error handling patterns documented
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Epic-to-structure mapping complete
- [x] Architecture validated and approved

### Architecture Readiness Assessment

**Overall Status:** 🟢 READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**First Implementation Step:**
```bash
flutter create --org com.hengsiekhai --project-name sreyleng_fintrack --platforms android --empty ./
```

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
