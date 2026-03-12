import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/presentation/providers/auth_provider.dart';
import '../features/auth/presentation/screens/login_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authRepo = ref.watch(authRepositoryProvider);
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: GoRouterRefreshStream(
      authRepo.authStateChanges(),
    ),
    redirect: (context, state) {
      final isLoggedIn = authState.value != null;
      final isOnLogin = state.matchedLocation == '/login';

      if (!isLoggedIn && !isOnLogin) return '/login';
      if (isLoggedIn && isOnLogin) return '/';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (_, _) => const LoginScreen(),
      ),
      GoRoute(
        path: '/',
        builder: (_, _) => const PlaceholderHomeScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(title: const Text('Error')),
      body: Center(
        child: Text('Page not found: ${state.uri.toString()}'),
      ),
    ),
  );
});

/// Temporary placeholder home screen with sign-out button for testing.
/// Will be replaced by the real Dashboard in Story 1.4.
class PlaceholderHomeScreen extends ConsumerWidget {
  const PlaceholderHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authRepositoryProvider).currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('FinTrack'),
        actions: [
          // Temporary sign-out button for testing (Story 1.2 only)
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Sign Out',
            onPressed: () async {
              final repo = ref.read(authRepositoryProvider);
              await repo.signOut();
            },
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Welcome to FinTrack v2!'),
            if (user != null) ...[
              const SizedBox(height: 16),
              Text('Signed in as: ${user.email ?? 'Unknown'}'),
            ],
          ],
        ),
      ),
    );
  }
}

/// Converts a [Stream] into a [ChangeNotifier] for GoRouter's
/// `refreshListenable` parameter. Notifies listeners whenever the
/// stream emits a new event (e.g., auth state changes).
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen(
      (_) => notifyListeners(),
      onError: (_) => notifyListeners(),
    );
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
