// Test setup file
// This runs before all tests

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key-for-testing-only'
process.env.JWT_EXPIRES_IN = '1h'

// ⚠️ WARNING: Make sure DATABASE_URL points to a TEST database, not production!
// The HTTP tests will DELETE ALL USERS from the database!
// See TEST_DATABASE_WARNING.md for more information

