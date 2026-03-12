import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sreyleng_fintrack/app/app.dart';
import 'package:sreyleng_fintrack/features/auth/presentation/providers/auth_provider.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:sreyleng_fintrack/features/auth/data/auth_repository.dart';

// Manual Fake implementation to avoid Mockito's Stream<User?> type issues
class FakeUser extends Fake implements User {
  @override
  final String email;

  FakeUser({this.email = 'test@example.com'});
}

class FakeAuthRepository extends Fake implements AuthRepository {
  final User? initialUser;

  FakeAuthRepository({this.initialUser});

  @override
  Stream<User?> authStateChanges() => Stream.value(initialUser);

  @override
  User? get currentUser => initialUser;
}

void main() {
  testWidgets('App renders login screen when unauthenticated',
      (WidgetTester tester) async {
    final fakeAuthRepo = FakeAuthRepository(initialUser: null);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authRepositoryProvider.overrideWithValue(fakeAuthRepo),
          authStateProvider.overrideWith((ref) => Stream<User?>.value(null)),
        ],
        child: const App(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Sign in with Google'), findsOneWidget);
    expect(find.text('FinTrack'), findsWidgets);
  });

  testWidgets('App renders placeholder home screen when authenticated',
      (WidgetTester tester) async {
    final fakeUser = FakeUser(email: 'test@example.com');
    final fakeAuthRepo = FakeAuthRepository(initialUser: fakeUser);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authRepositoryProvider.overrideWithValue(fakeAuthRepo),
          authStateProvider
              .overrideWith((ref) => Stream<User?>.value(fakeUser)),
        ],
        child: const App(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('FinTrack'), findsWidgets);
    expect(find.text('Welcome to FinTrack v2!'), findsOneWidget);
  });
}
