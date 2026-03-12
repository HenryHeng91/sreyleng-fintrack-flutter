import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sreyleng_fintrack/core/errors/app_exception.dart';
import 'package:sreyleng_fintrack/features/auth/data/auth_repository.dart';

// --- Manual Fakes to bypass Mockito type strictness ---

class FakeUser extends Fake implements User {
  @override
  final String uid;
  @override
  final String? email;
  @override
  final String? displayName;
  @override
  final String? photoURL;

  FakeUser({
    required this.uid,
    this.email,
    this.displayName,
    this.photoURL,
  });
}

class FakeUserCredential extends Fake implements UserCredential {
  @override
  final User? user;

  FakeUserCredential(this.user);
}

class FakeFirebaseAuth extends Fake implements FirebaseAuth {
  final StreamController<User?> authStateController =
      StreamController<User?>.broadcast();
  User? _currentUser;
  UserCredential Function(AuthCredential)? onSignInWithCredential;
  int signOutCallCount = 0;

  @override
  Stream<User?> authStateChanges() => authStateController.stream;

  @override
  User? get currentUser => _currentUser;

  void setCurrentUser(User? user) {
    _currentUser = user;
    authStateController.add(user);
  }

  @override
  Future<UserCredential> signInWithCredential(AuthCredential credential) async {
    if (onSignInWithCredential != null) {
      return onSignInWithCredential!(credential);
    }
    throw UnimplementedError('onSignInWithCredential not configured');
  }

  @override
  Future<void> signOut() async {
    signOutCallCount++;
    setCurrentUser(null);
  }

  void dispose() {
    authStateController.close();
  }
}

class FakeGoogleSignInAuthentication extends Fake
    implements GoogleSignInAuthentication {
  @override
  final String? idToken;
  final String? accessToken;

  FakeGoogleSignInAuthentication({this.idToken, this.accessToken});
}

class FakeGoogleSignInAccount extends Fake implements GoogleSignInAccount {
  final FakeGoogleSignInAuthentication fakeAuth;

  FakeGoogleSignInAccount(this.fakeAuth);

  @override
  GoogleSignInAuthentication get authentication => fakeAuth;
}

class FakeGoogleSignIn extends Fake implements GoogleSignIn {
  FakeGoogleSignInAccount? accountToReturn;
  int signOutCallCount = 0;
  String? initializedServerClientId;

  @override
  Future<void> initialize({
    String? clientId,
    String? serverClientId,
    String? nonce,
    String? hostedDomain,
  }) async {
    initializedServerClientId = serverClientId;
  }

  @override
  Future<GoogleSignInAccount> authenticate({
    List<String> scopeHint = const <String>[],
  }) async {
    if (accountToReturn == null) {
      throw Exception('User cancelled');
    }
    return accountToReturn!;
  }

  @override
  Future<void> signOut() async {
    signOutCallCount++;
  }
}

void main() {
  late FakeFirebaseAuth fakeFirebaseAuth;
  late FakeGoogleSignIn fakeGoogleSignIn;
  late AuthRepository authRepository;

  setUp(() {
    fakeFirebaseAuth = FakeFirebaseAuth();
    fakeGoogleSignIn = FakeGoogleSignIn();
    authRepository = AuthRepository(
      firebaseAuth: fakeFirebaseAuth,
      googleSignIn: fakeGoogleSignIn,
    );
  });

  tearDown(() {
    fakeFirebaseAuth.dispose();
  });

  group('AuthRepository', () {
    group('authStateChanges', () {
      test('emits user when signed in', () async {
        final stream = authRepository.authStateChanges();
        final fakeUser = FakeUser(uid: 'test-uid');

        final expectation = expectLater(
          stream,
          emits(predicate<User?>((user) => user?.uid == 'test-uid')),
        );

        fakeFirebaseAuth.setCurrentUser(fakeUser);

        await expectation;
      });

      test('emits null when signed out', () async {
        final stream = authRepository.authStateChanges();

        final expectation = expectLater(stream, emits(isNull));

        fakeFirebaseAuth.setCurrentUser(null);

        await expectation;
      });
    });

    group('currentUser', () {
      test('returns current user from FirebaseAuth', () {
        final fakeUser = FakeUser(uid: 'test-uid');
        fakeFirebaseAuth.setCurrentUser(fakeUser);

        expect(authRepository.currentUser, fakeUser);
      });

      test('returns null when no user signed in', () {
        fakeFirebaseAuth.setCurrentUser(null);

        expect(authRepository.currentUser, isNull);
      });
    });

    group('signInWithGoogle', () {
      test('returns AppUser on successful sign-in', () async {
        final fakeAuth =
            FakeGoogleSignInAuthentication(idToken: 'test-id-token');
        final fakeAccount = FakeGoogleSignInAccount(fakeAuth);

        final fakeUser = FakeUser(
          uid: 'firebase-uid',
          email: 'user@test.com',
          displayName: 'Test User',
          photoURL: 'https://photo.url',
        );
        final fakeCredential = FakeUserCredential(fakeUser);

        fakeGoogleSignIn.accountToReturn = fakeAccount;
        fakeFirebaseAuth.onSignInWithCredential = (_) => fakeCredential;

        final result = await authRepository.signInWithGoogle();

        expect(result.uid, 'firebase-uid');
        expect(result.email, 'user@test.com');
        expect(result.displayName, 'Test User');
        expect(result.photoUrl, 'https://photo.url');
      });

      test('throws AppException.auth when Firebase user is null', () async {
        final fakeAuth =
            FakeGoogleSignInAuthentication(idToken: 'test-id-token');
        final fakeAccount = FakeGoogleSignInAccount(fakeAuth);
        final fakeCredential = FakeUserCredential(null);

        fakeGoogleSignIn.accountToReturn = fakeAccount;
        fakeFirebaseAuth.onSignInWithCredential = (_) => fakeCredential;

        expect(
          () => authRepository.signInWithGoogle(),
          throwsA(isA<AuthException>()),
        );
      });

      test('throws AppException.cancelled on user cancellation', () async {
        fakeGoogleSignIn.accountToReturn = null; // triggers cancellation
        expect(
          () => authRepository.signInWithGoogle(),
          throwsA(isA<CancelledException>()),
        );
      });

      test('throws AppException.network on network exception', () async {
        final fakeAuth =
            FakeGoogleSignInAuthentication(idToken: 'test-id-token');
        final fakeAccount = FakeGoogleSignInAccount(fakeAuth);
        fakeGoogleSignIn.accountToReturn = fakeAccount;
        fakeFirebaseAuth.onSignInWithCredential =
            (_) => throw Exception('SocketException: mock network failure');

        expect(
          () => authRepository.signInWithGoogle(),
          throwsA(isA<NetworkException>()),
        );
      });
    });

    group('signOut', () {
      test('signs out from both Firebase and Google', () async {
        await authRepository.signOut();

        expect(fakeFirebaseAuth.signOutCallCount, 1);
        expect(fakeGoogleSignIn.signOutCallCount, 1);
      });
    });
  });
}
