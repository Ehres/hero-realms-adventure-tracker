# Testing Standards

## Organization

- Organize test files by feature.
- Group related tests using `describe`.

## Core Principles

- Write tests in English.
- Follow Arrange-Act-Assert (AAA) pattern.
- Prefer action-based user interaction tests.
- Use descriptive test names.
- Use existing types for tests.

## Isolation and Focus

- Test one functional unit only.
- Mock all external dependencies.
- Keep tests fast and independent.

## Coverage

- Test edge cases thoroughly.
- Verify error handling conditions.

## Robustness

- Avoid brittle assertion checks (e.g., exact messages).
- Use more flexible assertions (e.g., checking for substrings or using regex).
