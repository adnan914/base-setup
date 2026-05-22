import { assertTestDatabaseUrl } from './test-database-url';

describe('assertTestDatabaseUrl', () => {
  it('allows visibly isolated test databases', () => {
    expect(
      assertTestDatabaseUrl(
        'postgresql://postgres:postgres@localhost:5433/nestjs_app_test',
      ),
    ).toContain('nestjs_app_test');
  });

  it('rejects non-test database names', () => {
    expect(() =>
      assertTestDatabaseUrl(
        'postgresql://postgres:postgres@localhost:5432/nestjs_app',
      ),
    ).toThrow('database name containing "test"');
  });
});
