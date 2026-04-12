# Project Testing Rules

## 1. Mandatory Testing
**Every new feature implementation MUST include automated tests.**
- **Unit Tests**: Required for all new utilities, hooks, and validation logic.
- **Integration Tests**: Required for all new API routes and critical user flows.

## 2. Test Stack
- **Framework**: Vitest
- **Environment**: jsdom (for React components), node (for backend logic)
- **Libraries**: @testing-library/react, @testing-library/dom

## 3. Workflow
1. Write/Modify Code.
2. Write Tests covering positive and negative cases.
3. Run `npm run test` to verify.
4. Only commit/complete task if tests pass.

## 4. Coverage Goals
- Auth Logic: 100%
- Validation Schemas: 100%
- Critical API Paths: >80%
