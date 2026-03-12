import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'package:sreyleng_fintrack/features/auth/domain/app_user.dart';
import 'package:sreyleng_fintrack/core/errors/app_exception.dart';

import 'package:sreyleng_fintrack/core/constants/app_constants.dart';

class AuthRepository {
  final FirebaseAuth _firebaseAuth;
  final GoogleSignIn _googleSignIn;
  bool _isInitialized = false;

  AuthRepository({FirebaseAuth? firebaseAuth, GoogleSignIn? googleSignIn})
      : _firebaseAuth = firebaseAuth ?? FirebaseAuth.instance,
        _googleSignIn = googleSignIn ?? GoogleSignIn.instance;

  Future<void> _ensureInitialized() async {
    if (_isInitialized) return;
    try {
      await _googleSignIn.initialize(
        serverClientId: AppConstants.googleServerClientId,
      );
      _isInitialized = true;
    } catch (e) {
      // If already initialized by another call or platform, we can ignore or log.
      // But we mark it as initialized for our repo's state.
      _isInitialized = true;
    }
  }

  /// Exposes the Firebase auth state changes stream.
  Stream<User?> authStateChanges() => _firebaseAuth.authStateChanges();

  /// Returns the currently signed-in user, or null.
  User? get currentUser => _firebaseAuth.currentUser;

  /// Signs in with Google and returns an [AppUser].
  ///
  /// Throws [AppException.cancelled] if the user dismisses the sign-in dialog.
  /// Throws [AppException.network] on network failures.
  /// Throws [AppException.auth] on Firebase auth failures.
  Future<AppUser> signInWithGoogle() async {
    try {
      await _ensureInitialized();
      // google_sign_in v7.x: authenticate() with singleton instance
      final googleUser = await _googleSignIn.authenticate();

      // v7.x: authentication is a synchronous getter returning GoogleSignInAuthentication
      final googleAuth = googleUser.authentication;

      // v7.x: GoogleSignInAuthentication only provides idToken
      final credential = GoogleAuthProvider.credential(
        idToken: googleAuth.idToken,
      );

      final userCredential =
          await _firebaseAuth.signInWithCredential(credential);
      final user = userCredential.user;

      if (user == null) {
        throw const AppException.auth(
          message: 'Failed to retrieve user after sign-in',
        );
      }

      return AppUser(
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName,
        photoUrl: user.photoURL,
      );
    } on AppException {
      rethrow;
    } on FirebaseAuthException catch (e) {
      throw AppException.auth(
        message: e.message ?? 'Firebase authentication failed',
      );
    } catch (e) {
      final message = e.toString().toLowerCase();
      if (message.contains('cancel') || message.contains('sign_in_canceled')) {
        throw const AppException.cancelled();
      }
      if (message.contains('network') ||
          message.contains('socketexception') ||
          message.contains('timeoutexception')) {
        throw AppException.network(message: e.toString());
      }
      throw AppException.unknown(message: e.toString());
    }
  }

  /// Signs out from both Firebase Auth and Google Sign-In.
  Future<void> signOut() async {
    await Future.wait([
      _firebaseAuth.signOut(),
      _googleSignIn.signOut(),
    ]);
  }
}
