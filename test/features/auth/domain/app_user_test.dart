import 'package:flutter_test/flutter_test.dart';
import 'package:sreyleng_fintrack/features/auth/domain/app_user.dart';

void main() {
  group('AppUser', () {
    test('creates instance with required fields', () {
      const user = AppUser(
        uid: 'test-uid-123',
        email: 'test@example.com',
      );

      expect(user.uid, 'test-uid-123');
      expect(user.email, 'test@example.com');
      expect(user.displayName, isNull);
      expect(user.photoUrl, isNull);
    });

    test('creates instance with all fields', () {
      const user = AppUser(
        uid: 'test-uid-456',
        email: 'user@example.com',
        displayName: 'Test User',
        photoUrl: 'https://example.com/photo.jpg',
      );

      expect(user.uid, 'test-uid-456');
      expect(user.email, 'user@example.com');
      expect(user.displayName, 'Test User');
      expect(user.photoUrl, 'https://example.com/photo.jpg');
    });

    test('supports equality comparison', () {
      const user1 = AppUser(uid: 'uid-1', email: 'a@b.com');
      const user2 = AppUser(uid: 'uid-1', email: 'a@b.com');
      const user3 = AppUser(uid: 'uid-2', email: 'c@d.com');

      expect(user1, equals(user2));
      expect(user1, isNot(equals(user3)));
    });

    test('copyWith creates modified copy', () {
      const original = AppUser(
        uid: 'uid-1',
        email: 'old@example.com',
        displayName: 'Old Name',
      );

      final modified = original.copyWith(
        email: 'new@example.com',
        displayName: 'New Name',
      );

      expect(modified.uid, 'uid-1'); // unchanged
      expect(modified.email, 'new@example.com');
      expect(modified.displayName, 'New Name');
    });

    test('serializes to and from JSON', () {
      const user = AppUser(
        uid: 'uid-json',
        email: 'json@example.com',
        displayName: 'JSON User',
        photoUrl: 'https://photo.url',
      );

      final json = user.toJson();
      expect(json['uid'], 'uid-json');
      expect(json['email'], 'json@example.com');
      expect(json['displayName'], 'JSON User');
      expect(json['photoUrl'], 'https://photo.url');

      final restored = AppUser.fromJson(json);
      expect(restored, equals(user));
    });

    test('toString returns readable representation', () {
      const user = AppUser(uid: 'uid-1', email: 'test@test.com');
      final str = user.toString();

      expect(str, contains('AppUser'));
      expect(str, contains('uid-1'));
      expect(str, contains('test@test.com'));
    });
  });
}
