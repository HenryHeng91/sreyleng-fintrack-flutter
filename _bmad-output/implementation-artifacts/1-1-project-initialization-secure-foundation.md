# Story 1.1: Project Initialization & Secure Foundation
Status: done

## Story

As a user,
I want the FinTrack app to be set up with a secure, modern foundation,
so that I can begin using a reliable and well-structured application from day one.

## Acceptance Criteria

1. **Given** a completely new Flutter environment cleanly isolated from the legacy Angular prototype
   **When** the project is initialized using `flutter create`
   **Then** the directory structure must follow a feature-first approach
   **And** core dependencies like Riverpod, GoRouter, `freezed`, and Firebase core must be installed
   **And** the app must compile and launch successfully on an Android device/emulator displaying a placeholder home screen

## Tasks / Subtasks

- [x] Task 1: Initialize Flutter Project (AC: #1)
  - [x] 1.1 Run `flutter create --org com.hengsiekhai --project-name sreyleng_fintrack --platforms android --empty ./` from the project root
  - [x] 1.2 Verify project compiles with `flutter run` on an Android emulator or device
  - [x] 1.3 Verify `.gitignore` is present and covers standard Flutter ignores

- [x] Task 2: Establish Feature-First Clean Architecture Directory Structure (AC: #1)
  - [x] 2.1 Create `lib/app/` with `app.dart`, `router.dart`, `theme.dart`
  - [x] 2.2 Create `lib/core/constants/` with `app_constants.dart`, `firestore_paths.dart`
  - [x] 2.3 Create `lib/core/extensions/` with `date_extensions.dart`, `string_extensions.dart`
  - [x] 2.4 Create `lib/core/providers/` with `filter_provider.dart` (placeholder)
  - [x] 2.5 Create `lib/core/utils/` with `date_utils.dart`, `currency_utils.dart`
  - [x] 2.6 Create `lib/core/errors/` with `app_exception.dart`
  - [x] 2.7 Create feature scaffolds: `lib/features/auth/`, `lib/features/transactions/`, `lib/features/dashboard/`, `lib/features/ocr/`, `lib/features/settings/`, `lib/features/notifications/` — each with `data/`, `domain/`, `presentation/` subdirectories
  - [x] 2.8 Create `lib/shared/widgets/` and `lib/shared/theme/`
  - [x] 2.9 Create `test/features/` and `test/core/` mirroring `lib/` structure
  - [x] 2.10 Create `firebase/` directory with placeholder `firestore.rules` and `firestore.indexes.json`
  - [x] 2.11 Create `assets/images/` directory
  - [x] 2.12 Create `.env.example` file with placeholders for `GEMINI_API_KEY`

- [x] Task 3: Install Core Dependencies in `pubspec.yaml` (AC: #1)
  - [x] 3.1 Add runtime dependencies:
    - `flutter_riverpod: ^3.2.1` (state management)
    - `riverpod_annotation: ^4.0.2` (code generation)
    - `go_router: ^17.1.0` (routing)
    - `freezed_annotation: ^3.1.0` (immutable models)
    - `json_annotation: ^4.9.0` (JSON serialization)
    - `firebase_core: latest` (Firebase init)
    - `firebase_auth: latest` (authentication)
    - `cloud_firestore: latest` (database)
    - `google_sign_in: latest` (Google SSO)
    - `flutter_dotenv: latest` (env config)
    - `dio: latest` (HTTP client)
    - `intl: latest` (date formatting)
  - [x] 3.2 Add dev dependencies:
    - `freezed: ^3.2.3` (code generator)
    - `json_serializable: ^6.13.0` (JSON code gen)
    - `build_runner: latest` (code gen runner)
    - `riverpod_generator: latest` (Riverpod code gen)
    - `flutter_lints: latest` (lint rules)
  - [x] 3.3 Run `flutter pub get` to resolve all dependencies
  - [x] 3.4 Add `assets/` and `.env` to `pubspec.yaml` asset declarations

- [x] Task 4: Configure Firebase Project (AC: #1)
  - [x] 4.1 Ensure Firebase CLI and FlutterFire CLI are installed (`dart pub global activate flutterfire_cli`)
  - [x] 4.2 Run `flutterfire configure` to generate `firebase_options.dart`
  - [x] 4.3 Initialize Firebase in `lib/main.dart` with `Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform)`
  - [x] 4.4 Wrap app with `ProviderScope` from Riverpod in `main.dart`
  - [x] 4.5 Enable Firestore offline persistence: `FirebaseFirestore.instance.settings = const Settings(persistenceEnabled: true)`

- [x] Task 5: Set Up Placeholder App Shell (AC: #1)
  - [x] 5.1 Create `lib/app/app.dart` with `MaterialApp.router` using GoRouter
  - [x] 5.2 Create `lib/app/theme.dart` with Material Design 3 theme (using `ColorScheme.fromSeed` or similar)
  - [x] 5.3 Create `lib/app/router.dart` with a single route displaying a placeholder home screen
  - [x] 5.4 Set up `lib/main.dart`: Firebase init → ProviderScope → App widget
  - [x] 5.5 Confirm the app compiles and runs, showing the placeholder screen

- [x] Task 6: Verify Project Integrity (AC: #1)
  - [x] 6.1 Run `flutter analyze` — zero errors expected
  - [x] 6.2 Run `flutter test` — default test passes
  - [x] 6.3 Run `flutter build apk --debug` — builds successfully
  - [x] 6.4 Verify feature-first folder structure is complete

## Dev Notes

### Architecture Compliance

- **Project Structure**: Feature-first Clean Architecture. See exact folder layout below.
- **State Management**: Riverpod (`flutter_riverpod` 3.2.1). Providers follow `camelCase` + `Provider` suffix.
- **Routing**: GoRouter (`go_router` 17.1.0). Declarative URL-based routing with `ShellRoute` for tab navigation (set up in Story 1.4).
- **Data Models**: `freezed` + `json_serializable` for all models. No hand-written `toJson`/`fromJson`.
- **Error Handling**: `AsyncValue` for all async state. Result pattern via freezed union types.
- **UI**: Material Design 3. Custom theme in `lib/app/theme.dart`.

### Exact Directory Structure to Create

```
lib/
├── main.dart                    # Entry point: Firebase init, ProviderScope
├── app/
│   ├── app.dart                 # MaterialApp.router + GoRouter
│   ├── router.dart              # Route definitions (placeholder for now)
│   └── theme.dart               # Material 3 theme data
├── core/
│   ├── constants/
│   │   ├── app_constants.dart    # Allowlisted emails, defaults
│   │   └── firestore_paths.dart  # Collection/doc path strings
│   ├── extensions/
│   │   ├── date_extensions.dart
│   │   └── string_extensions.dart
│   ├── providers/
│   │   └── filter_provider.dart  # Global filter state (placeholder)
│   ├── utils/
│   │   ├── date_utils.dart
│   │   └── currency_utils.dart
│   └── errors/
│       └── app_exception.dart    # Base exception types (freezed)
├── features/
│   ├── auth/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── transactions/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── dashboard/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── ocr/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── settings/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── notifications/
│       ├── data/
│       └── presentation/
└── shared/
    ├── widgets/
    └── theme/
```

### Naming Conventions (Enforced)

| Area | Convention | Example |
|------|-----------|--------|
| Dart files | `snake_case.dart` | `transaction_repository.dart` |
| Classes | `PascalCase` | `TransactionRepository` |
| Functions/variables | `camelCase` | `getTransactions()` |
| Riverpod providers | `camelCase` + `Provider` | `authStateProvider` |
| Firestore collections | `snake_case` plural | `transactions` |
| Feature folders | `snake_case` | `lib/features/transactions/` |

### Firebase Setup Command

```bash
# Prerequisites
npm install -g firebase-tools
dart pub global activate flutterfire_cli

# Configure (interactive — select your Firebase project)
flutterfire configure
```

This generates `lib/firebase_options.dart` which is imported in `main.dart`.

### main.dart Pattern

```dart
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'firebase_options.dart';
import 'app/app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  // Enable offline persistence
  FirebaseFirestore.instance.settings = const Settings(
    persistenceEnabled: true,
  );
  runApp(const ProviderScope(child: App()));
}
```

### Critical Constraints

- **Isolation**: Flutter project is initialized INSIDE `d:\Source code\sreyleng-fintrack-flutter\`. The `_legacy_angular_reference/` folder contains the old Angular code — DO NOT touch, delete, or modify it.
- **Android Only**: `--platforms android` flag in `flutter create`. No iOS/web/desktop targets.
- **No CI/CD**: Manual `flutter build apk` distribution. No pipeline setup needed.
- **Free Tier Only**: Firebase Spark Plan (free). No paid Cloud Functions.
- **Env Config**: API keys go in `.env` file (gitignored), loaded via `flutter_dotenv`.

### Anti-Patterns to Avoid

- ❌ Do NOT use Bloc — Riverpod is the chosen state management
- ❌ Do NOT hand-write JSON serialization — always use `freezed` + `json_serializable`
- ❌ Do NOT put feature code outside `lib/features/` directories
- ❌ Do NOT use `setState` for any data flow — use Riverpod providers exclusively
- ❌ Do NOT create iOS/web platform targets
- ❌ Do NOT commit `.env` file or API keys to git
- ❌ Do NOT modify anything in `_legacy_angular_reference/`, `_bmad/`, or `_bmad-output/`

### Project Structure Notes

- The Flutter project will be initialized at the repository root (`d:\Source code\sreyleng-fintrack-flutter\`)
- This means `pubspec.yaml`, `lib/`, `test/`, `android/` etc. will be created at the root
- Existing folders (`_bmad/`, `_bmad-output/`, `_legacy_angular_reference/`, `docs/`, `.agent/`) must remain untouched
- Add these to `.gitignore` if not already present: `.env`, `*.g.dart`, `*.freezed.dart` (generated code is debatable — include for now)

### References

- [Architecture: Starter Template](file:///d:/Source%20code/sreyleng-fintrack-flutter/_bmad-output/planning-artifacts/architecture.md#starter-template-evaluation) — `flutter create` with `--empty` flag
- [Architecture: Project Structure](file:///d:/Source%20code/sreyleng-fintrack-flutter/_bmad-output/planning-artifacts/architecture.md#complete-project-directory-structure) — Full directory tree
- [Architecture: Core Decisions](file:///d:/Source%20code/sreyleng-fintrack-flutter/_bmad-output/planning-artifacts/architecture.md#core-architectural-decisions) — All tech stack decisions with versions
- [Architecture: Naming Patterns](file:///d:/Source%20code/sreyleng-fintrack-flutter/_bmad-output/planning-artifacts/architecture.md#naming-patterns) — Enforced conventions
- [PRD: Core Architecture](file:///d:/Source%20code/sreyleng-fintrack-flutter/_bmad-output/planning-artifacts/fintrack-v2-flutter-prd.md#3-core-architecture) — Flutter + Firebase + Auth
- [Epics: Story 1.1](file:///d:/Source%20code/sreyleng-fintrack-flutter/_bmad-output/planning-artifacts/fintrack-v2-flutter-epics.md#story-11-project-initialization--secure-foundation) — Original acceptance criteria

## Dev Agent Record

### Agent Model Used

Antigravity (Google DeepMind)

### Debug Log References

- Flutter SDK installed at `C:\src\flutter` (v3.41.4, Dart 3.11.1)
- Android SDK installed via Android Studio
- Firebase project `sreyleng-fitrack` configured via `flutterfire configure`

### Completion Notes List

- ✅ Flutter project initialized with `flutter create --org com.hengsiekhai --project-name sreyleng_fintrack --platforms android --empty ./`
- ✅ Feature-first Clean Architecture directory structure created (6 features, core modules, shared widgets)
- ✅ All 12 runtime + 5 dev dependencies installed via `flutter pub add`
- ✅ Firebase configured: `firebase_options.dart` generated, Firebase initialized in `main.dart` with offline persistence
- ✅ Placeholder App Shell: `MaterialApp.router` with GoRouter, Material 3 theme, PlaceholderHomeScreen
- ✅ `flutter analyze` — No issues found
- ✅ `flutter test` — All tests passed (1 widget test for App shell)
- ✅ `flutter build apk --debug` — APK built successfully at `build/app/outputs/flutter-apk/app-debug.apk`

### File List
- `lib/main.dart` (modified)
- `lib/app/app.dart` (new)
- `lib/app/router.dart` (new)
- `lib/app/theme.dart` (new)
- `lib/firebase_options.dart` (generated by flutterfire)
- `lib/core/constants/app_constants.dart` (new, placeholder)
- `lib/core/constants/firestore_paths.dart` (new, placeholder)
- `lib/core/extensions/date_extensions.dart` (new, placeholder)
- `lib/core/extensions/string_extensions.dart` (new, placeholder)
- `lib/core/providers/filter_provider.dart` (new, placeholder)
- `lib/core/utils/date_utils.dart` (new, placeholder)
- `lib/core/utils/currency_utils.dart` (new, placeholder)
- `lib/core/errors/app_exception.dart` (new, placeholder)
- `test/app_test.dart` (new)
- `pubspec.yaml` (modified)
- `.env` (new)
- `.env.example` (new)
- `firebase/firestore.rules` (new, placeholder)
- `firebase/firestore.indexes.json` (new, placeholder)
- `firebase.json` (new, generated by flutterfire)
- `android/` directory tree (new, platform scaffold)
- `pubspec.lock` (new, dependency lock)
- `.gitignore` (modified)
- `analysis_options.yaml` (new, linting rules)

### Review Follow-ups (AI)
- ✅ [High] Added missing `firebase.json` and `android/` native scaffold to File List
- ✅ [Medium] Fixed false claims of dependency versions for `freezed_annotation` and `riverpod_annotation`
- ✅ [Medium] Added `pubspec.lock`, `.gitignore`, and `analysis_options.yaml` to File List
- ✅ [Low] Added `errorBuilder` to GoRouter configuration in `lib/app/router.dart`

## Change Log

- **2026-03-06**: Story 1.1 implemented — Project initialized with Flutter 3.41.4, feature-first architecture scaffolded, all core dependencies installed, Firebase configured, placeholder app shell created, all verification gates passed.

