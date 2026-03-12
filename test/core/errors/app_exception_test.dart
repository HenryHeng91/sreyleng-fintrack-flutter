import 'package:flutter_test/flutter_test.dart';
import 'package:sreyleng_fintrack/core/errors/app_exception.dart';

void main() {
  group('AppException', () {
    test('creates cancelled exception with default message', () {
      const exception = AppException.cancelled();
      expect(exception.message, 'Operation was cancelled');
    });

    test('creates cancelled exception with custom message', () {
      const exception = AppException.cancelled(
        message: 'Sign-in was cancelled by user',
      );
      expect(exception.message, 'Sign-in was cancelled by user');
    });

    test('creates network exception', () {
      const exception = AppException.network(
        message: 'No internet connection',
      );
      expect(exception.message, 'No internet connection');
      expect(exception, isA<NetworkException>());
    });

    test('creates auth exception', () {
      const exception = AppException.auth(
        message: 'Invalid credentials',
      );
      expect(exception.message, 'Invalid credentials');
      expect(exception, isA<AuthException>());
    });

    test('creates unknown exception with default message', () {
      const exception = AppException.unknown();
      expect(exception.message, 'An unknown error occurred');
      expect(exception, isA<UnknownException>());
    });

    test('implements Exception interface', () {
      const exception = AppException.cancelled();
      expect(exception, isA<Exception>());
    });

    test('supports equality comparison', () {
      const e1 = AppException.cancelled(message: 'test');
      const e2 = AppException.cancelled(message: 'test');
      const e3 = AppException.cancelled(message: 'other');

      expect(e1, equals(e2));
      expect(e1, isNot(equals(e3)));
    });

    test('supports pattern matching with when', () {
      const AppException exception = AppException.network(
        message: 'Network down',
      );

      final result = switch (exception) {
        CancelledException() => 'cancelled',
        NetworkException() => 'network',
        AuthException() => 'auth',
        UnknownException() => 'unknown',
      };

      expect(result, 'network');
    });

    test('toString returns readable representation', () {
      const exception = AppException.auth(message: 'Test error');
      final str = exception.toString();

      expect(str, contains('AppException.auth'));
      expect(str, contains('Test error'));
    });
  });
}
