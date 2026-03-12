/// Application constants and secret identifiers.
class AppConstants {
  /// The Web Client ID from the Firebase console, required for 
  /// Google Sign-In on Android.
  static const googleServerClientId = 
      '265231719413-1gvon8dd1k99cjs56vt6g80bc42buq3c.apps.googleusercontent.com';
  
  /// List of allowed users for authentication.
  /// (Strict allowlist enforcement is scheduled for Story 1.3)
  static const allowedEmails = [
    'hengsiekhai@gmail.com',
    'sreyleng.vorn@gmail.com',
  ];
}
