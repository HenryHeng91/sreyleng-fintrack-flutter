import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/auth_repository.dart';

/// Provides the [AuthRepository] singleton instance.
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

/// Streams the Firebase auth state (logged-in [User] or null).
///
/// Used by GoRouter redirect to gate access to protected routes.
final authStateProvider = StreamProvider<User?>((ref) {
  final repo = ref.watch(authRepositoryProvider);
  return repo.authStateChanges();
});

/// Manages the sign-in async state (loading / success / error).
final signInProvider =
    AsyncNotifierProvider<SignInNotifier, void>(SignInNotifier.new);

class SignInNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {
    // Initial state — not loading.
  }

  /// Triggers Google Sign-In flow via [AuthRepository].
  Future<void> signIn() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(authRepositoryProvider);
      await repo.signInWithGoogle();
    });
  }
}
