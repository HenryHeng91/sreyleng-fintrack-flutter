import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sreyleng_fintrack/app/app.dart';

void main() {
  testWidgets('App renders placeholder home screen', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: App()));
    await tester.pumpAndSettle();

    expect(find.text('FinTrack Placeholder'), findsOneWidget);
    expect(find.text('Welcome to FinTrack v2!'), findsOneWidget);
  });
}
