# Frontend

## Running Tests

### Unit Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### UI Mode
```bash
npm run test:ui
```

### Coverage
```bash
npm run test:coverage
```

## Test Structure

- `tests/components/` - Component tests
- `tests/utils/` - Utility function tests

## Test Conventions

- Use AAA pattern (Arrange, Act, Assert)
- Test files: `*.spec.ts` or `*.spec.tsx`
- Cover both success and failure scenarios
- Use Testing Library for component tests
