import 'package:freezed_annotation/freezed_annotation.dart';

part 'app_exception.freezed.dart';

@freezed
sealed class AppException with _$AppException implements Exception {
  const factory AppException.cancelled({
    @Default('Operation was cancelled') String message,
  }) = CancelledException;

  const factory AppException.network({
    @Default('Network error occurred') String message,
  }) = NetworkException;

  const factory AppException.auth({
    @Default('Authentication error') String message,
  }) = AuthException;

  const factory AppException.unknown({
    @Default('An unknown error occurred') String message,
  }) = UnknownException;
}
