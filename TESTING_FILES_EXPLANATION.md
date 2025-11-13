# Testing Implementation - Files Explanation

This document explains all files created during the TDD implementation, their purpose, and how they work together.

---

## 📁 Backend Test Infrastructure

### Configuration Files

#### `backend/jest.config.js`
**Purpose:** Jest testing framework configuration
**What it does:**
- Configures Jest to work with TypeScript using `ts-jest`
- Sets up test environment (Node.js)
- Defines test file patterns (`*.spec.ts`, `*.test.ts`)
- Configures coverage collection and reporting
- Points to setup file for test initialization

**Key settings:**
- `preset: 'ts-jest'` - Enables TypeScript support
- `testEnvironment: 'node'` - For backend/Node.js tests
- `roots` - Where to look for tests
- `collectCoverageFrom` - Which files to include in coverage

---

#### `backend/tests/setup.ts`
**Purpose:** Global test setup that runs before all tests
**What it does:**
- Sets `NODE_ENV` to 'test' to prevent server from starting during tests
- Sets test environment variables (JWT_SECRET, JWT_EXPIRES_IN)
- Ensures consistent test environment across all test files

**Why needed:** Prevents side effects (like server starting) and provides test-specific configuration

---

## 🧪 Backend Test Files

### Unit Tests

#### `backend/tests/unit/app.spec.ts`
**Purpose:** Smoke test for the Express application
**What it tests:**
- GET `/health` endpoint returns 200 status
- Response body contains `{ status: 'ok' }`

**Why important:** Verifies the app is properly configured and can handle basic requests. This is the first test that should pass.

**Test Pattern:** AAA (Arrange, Act, Assert)
- **Arrange:** No setup needed (simple test)
- **Act:** Make GET request to `/health`
- **Assert:** Check status code and response body

---

#### `backend/tests/unit/validation/userSchema.spec.ts`
**Purpose:** Tests for Zod validation schema
**What it tests:**
- ✅ Valid user data (with normalization)
- ✅ Minimal valid data (email + password only)
- ❌ Invalid email format
- ❌ Password too short (< 8 characters)
- ❌ Name too short (< 2 characters)
- ❌ Missing required fields
- ✅ Email normalization (trim + lowercase)

**Why important:** Ensures data validation rules are correctly implemented before data reaches the database or business logic.

**Key test cases:**
1. **Normalization test:** Verifies `"  USER@EXAMPLE.COM  "` becomes `"user@example.com"`
2. **Validation test:** Ensures invalid data is rejected with proper error messages

---

#### `backend/tests/unit/useCases/CreateUser.spec.ts`
**Purpose:** Unit tests for the CreateUser use case (TDD approach)
**What it tests:**
- ✅ Successfully creates user and returns user without password
- ✅ Creates user with minimal data (email + password only)
- ❌ Rejects duplicate email addresses
- ❌ Rejects password shorter than 8 characters
- ❌ Handles case-insensitive email duplicates

**Why important:** Tests business logic in isolation without database or external dependencies. Uses fake implementations for fast, reliable tests.

**Test Pattern:** TDD (Test-Driven Development)
- Tests are written first (Red)
- Implementation follows (Green)
- Code is refactored (Refactor)

**Dependencies:** Uses `FakeUserRepository` and `FakePasswordHasher` instead of real implementations

---

### HTTP/Integration Tests

#### `backend/tests/http/users.spec.ts`
**Purpose:** Tests HTTP endpoints using supertest
**What it tests:**
- ✅ POST `/api/users` returns 201 with valid payload
- ❌ POST `/api/users` returns 400 with invalid payload
- ❌ POST `/api/users` returns 409 for duplicate email

**Why important:** Tests the full HTTP layer including:
- Request/response handling
- Status codes
- Error messages
- Database interactions

**Setup/Cleanup:**
- `beforeEach`: Cleans database before each test
- `afterAll`: Disconnects Prisma client after all tests

**Note:** Currently uses fake token - in production, should use real JWT token generation

---

## 🎭 Fake Implementations (Test Doubles)

### `backend/tests/fakes/FakeUserRepository.ts`
**Purpose:** In-memory implementation of UserRepository for testing
**What it does:**
- Stores users in memory (array)
- Implements `findByEmail()` and `create()` methods
- Provides helper methods: `clear()`, `getAll()`

**Why needed:**
- Fast tests (no database required)
- Isolated tests (no side effects)
- Predictable behavior
- Easy to reset between tests

**When to use:** Unit tests that need to test business logic without database complexity

**How it works:**
```typescript
// Stores users in memory
private users: User[] = []

// Normalizes email (like real implementation)
email: data.email.toLowerCase().trim()
```

---

### `backend/tests/fakes/FakePasswordHasher.ts`
**Purpose:** Simple password hasher for testing
**What it does:**
- `hash()`: Prefixes password with "hashed_"
- `compare()`: Checks if password matches stored hash
- Maintains a map of hashes for comparison

**Why needed:**
- Fast tests (no bcrypt computation)
- Deterministic (same input = same output)
- Easy to verify in tests

**When to use:** Unit tests that need password hashing without bcrypt overhead

**How it works:**
```typescript
// Simple fake hash
hash("password123") → "hashed_password123"

// Comparison
compare("password123", "hashed_password123") → true
```

---

## 🏗️ Domain Layer (Business Logic)

### Interfaces

#### `backend/src/domain/interfaces/UserRepository.ts`
**Purpose:** Defines contract for user data access
**What it defines:**
- `User` type (domain model)
- `CreateUserData` type (input for creation)
- `UserRepository` interface with methods:
  - `findByEmail(email: string): Promise<User | null>`
  - `create(data: CreateUserData): Promise<User>`

**Why important:**
- **Dependency Inversion:** Business logic doesn't depend on Prisma
- **Testability:** Can swap real implementation with fake for testing
- **Flexibility:** Can change database without changing business logic

**Implementations:**
- `PrismaUserRepository` (real, uses database)
- `FakeUserRepository` (fake, uses memory)

---

#### `backend/src/domain/interfaces/PasswordHasher.ts`
**Purpose:** Defines contract for password hashing
**What it defines:**
- `PasswordHasher` interface with methods:
  - `hash(password: string): Promise<string>`
  - `compare(password: string, hashedPassword: string): Promise<boolean>`

**Why important:**
- **Dependency Inversion:** Business logic doesn't depend on bcrypt
- **Testability:** Can swap real implementation with fake for testing
- **Flexibility:** Can change hashing algorithm without changing business logic

**Implementations:**
- `BcryptPasswordHasher` (real, uses bcrypt)
- `FakePasswordHasher` (fake, simple prefix)

---

### Use Cases

#### `backend/src/domain/useCases/CreateUser.ts`
**Purpose:** Business logic for creating users (TDD implementation)
**What it does:**
1. Validates password length (≥ 8 characters)
2. Checks if email already exists
3. Hashes password
4. Creates user in repository
5. Returns user without password

**Error handling:**
- `EmailAlreadyTakenError` - When email already exists
- `PasswordTooShortError` - When password < 8 characters

**Why important:**
- Contains core business rules
- Independent of database/HTTP layer
- Fully testable with fakes
- Reusable across different interfaces (HTTP, CLI, etc.)

**Dependencies:** 
- `UserRepository` (injected)
- `PasswordHasher` (injected)

**Return type:** `CreateUserResult` (user without password)

---

## 🔌 Infrastructure Layer (Adapters)

### `backend/src/infrastructure/adapters/PrismaUserRepository.ts`
**Purpose:** Real implementation of UserRepository using Prisma
**What it does:**
- Implements `UserRepository` interface
- Uses Prisma to interact with PostgreSQL database
- Normalizes email (lowercase + trim) before database operations

**When used:** In production and integration tests

**Key features:**
- Email normalization (matches fake implementation)
- Type casting to domain `User` type
- Error handling for database operations

---

### `backend/src/infrastructure/adapters/BcryptPasswordHasher.ts`
**Purpose:** Real implementation of PasswordHasher using bcrypt
**What it does:**
- Implements `PasswordHasher` interface
- Uses bcrypt with 12 salt rounds for hashing
- Provides secure password comparison

**When used:** In production and integration tests

**Key features:**
- Secure hashing (bcrypt with 12 rounds)
- Constant-time comparison (prevents timing attacks)

---

## ✅ Validation Layer

### `backend/src/validation/userSchema.ts`
**Purpose:** Zod schema for user creation validation
**What it validates:**
- **Email:** Required, valid format, normalized (trim + lowercase)
- **Password:** Required, minimum 8 characters
- **Name:** Optional, minimum 2 characters if provided
- **Role:** Optional enum (Admin, User, Manager)

**Transformations:**
- Email: `"  USER@EXAMPLE.COM  "` → `"user@example.com"`
- Name: `"  John Doe  "` → `"John Doe"`

**Why important:**
- Input validation at the edge (HTTP layer)
- Type-safe validation
- Automatic normalization
- Clear error messages

**Usage:**
```typescript
const result = UserCreateSchema.safeParse(input)
if (result.success) {
  // Use result.data (normalized and validated)
} else {
  // Handle result.error (ZodError)
}
```

---

## 🎨 Frontend Test Infrastructure

### Configuration Files

#### `frontend/vitest.config.ts`
**Purpose:** Vitest testing framework configuration
**What it does:**
- Configures Vitest for React/Next.js
- Sets up jsdom environment (simulates browser)
- Configures path aliases (`@/` → `./src/`)
- Points to setup file

**Key settings:**
- `environment: 'jsdom'` - Simulates browser DOM
- `globals: true` - Makes `describe`, `it`, `expect` available globally
- React plugin for JSX support

---

#### `frontend/tests/setup.ts`
**Purpose:** Global test setup for frontend tests
**What it does:**
- Extends Vitest's `expect` with jest-dom matchers
- Provides DOM matchers like `toBeInTheDocument()`, `toHaveTextContent()`
- Cleans up after each test (removes rendered components)

**Why needed:**
- Enables React Testing Library matchers
- Prevents test pollution between tests

---

## 🧪 Frontend Test Files

### `frontend/tests/components/LoginPage.spec.tsx`
**Purpose:** Component test for LoginPage
**What it tests:**
- ✅ Renders email input field
- ✅ Renders password input field
- ✅ Renders submit button

**Why important:**
- Verifies component renders correctly
- Ensures form elements are present
- Foundation for more complex tests (validation, submission)

**Test Pattern:** AAA
- **Arrange:** Wrap component in `AuthProvider` (required context)
- **Act:** Render component
- **Assert:** Check for form elements using Testing Library queries

**Dependencies:**
- `AuthProvider` - Required context for authentication
- `@testing-library/react` - For rendering and queries
- `@testing-library/jest-dom` - For DOM matchers

---

## 📚 Documentation Files

### `backend/README.md`
**Purpose:** Documentation for running backend tests
**What it contains:**
- Test commands (`npm test`, `npm run test:watch`, etc.)
- Test structure explanation
- Test conventions (AAA pattern, naming)
- File organization

---

### `frontend/README.md`
**Purpose:** Documentation for running frontend tests
**What it contains:**
- Test commands (`npm test`, `npm run test:ui`, etc.)
- Test structure explanation
- Test conventions
- File organization

---

### `TESTING_IMPLEMENTATION.md`
**Purpose:** Summary of TDD implementation progress
**What it contains:**
- Day-by-day implementation status
- Files created for each day
- Next steps and future work
- Test structure overview

---

## 🔄 How Files Work Together

### Test Flow Example: Creating a User

1. **HTTP Request** → `tests/http/users.spec.ts`
   - Tests the full HTTP endpoint
   - Uses real database (Prisma)

2. **Validation** → `src/validation/userSchema.ts`
   - Validates and normalizes input
   - Tested by `tests/unit/validation/userSchema.spec.ts`

3. **Business Logic** → `src/domain/useCases/CreateUser.ts`
   - Contains business rules
   - Tested by `tests/unit/useCases/CreateUser.spec.ts`
   - Uses `FakeUserRepository` and `FakePasswordHasher`

4. **Data Access** → `src/infrastructure/adapters/PrismaUserRepository.ts`
   - Saves to database
   - Implements `UserRepository` interface

5. **Password Hashing** → `src/infrastructure/adapters/BcryptPasswordHasher.ts`
   - Hashes password securely
   - Implements `PasswordHasher` interface

### Test Isolation Levels

```
┌─────────────────────────────────────┐
│  HTTP Tests (Integration)          │
│  - Uses real database               │
│  - Tests full stack                 │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Use Case Tests (Unit)              │
│  - Uses fake repository             │
│  - Tests business logic only        │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Validation Tests (Unit)            │
│  - No dependencies                  │
│  - Tests schema rules               │
└─────────────────────────────────────┘
```

---

## 📊 File Organization Summary

```
backend/
├── jest.config.js                    # Jest configuration
├── src/
│   ├── app.ts                        # Express app (exported for testing)
│   ├── validation/
│   │   └── userSchema.ts            # Zod validation schema
│   ├── domain/
│   │   ├── interfaces/
│   │   │   ├── UserRepository.ts    # Repository interface
│   │   │   └── PasswordHasher.ts    # Hasher interface
│   │   └── useCases/
│   │       └── CreateUser.ts        # Business logic
│   └── infrastructure/
│       └── adapters/
│           ├── PrismaUserRepository.ts    # Real repository
│           └── BcryptPasswordHasher.ts    # Real hasher
└── tests/
    ├── setup.ts                      # Test environment setup
    ├── unit/
    │   ├── app.spec.ts              # Smoke test
    │   ├── validation/
    │   │   └── userSchema.spec.ts   # Validation tests
    │   └── useCases/
    │       └── CreateUser.spec.ts    # Use case tests
    ├── http/
    │   └── users.spec.ts             # HTTP route tests
    └── fakes/
        ├── FakeUserRepository.ts     # Fake repository
        └── FakePasswordHasher.ts     # Fake hasher

frontend/
├── vitest.config.ts                  # Vitest configuration
└── tests/
    ├── setup.ts                      # Test environment setup
    └── components/
        └── LoginPage.spec.tsx        # Component test
```

---

## 🎯 Key Concepts

### Dependency Inversion
- Business logic (use cases) depends on interfaces, not implementations
- Allows swapping real implementations with fakes for testing

### Test Doubles (Fakes)
- `FakeUserRepository`: In-memory storage for fast unit tests
- `FakePasswordHasher`: Simple hashing for fast unit tests

### Test Pyramid
- **Unit Tests** (many): Fast, isolated, test business logic
- **Integration Tests** (some): Slower, test HTTP + database
- **E2E Tests** (few): Slowest, test full user flow

### AAA Pattern
All tests follow Arrange-Act-Assert:
1. **Arrange:** Set up test data and dependencies
2. **Act:** Execute the code being tested
3. **Assert:** Verify the results

---

## 🚀 Next Steps

To use these tests:

1. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Run tests:**
   ```bash
   # Backend
   cd backend && npm test
   
   # Frontend
   cd frontend && npm test
   ```

3. **View coverage:**
   ```bash
   cd backend && npm run test:coverage
   cd frontend && npm run test:coverage
   ```

All files are ready to use and follow TDD best practices! 🎉

