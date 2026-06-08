# Git Workflow

## Branch Strategy

```
main
│
├── develop
│   ├── feature/backend-setup
│   ├── feature/auth-local
│   ├── feature/workout-coach-agent
│   ├── feature/nutrition-agent-backend
│   ├── feature/cicd-pipeline
│   ├── feature/docker-support
│   ├── feature/mds-documentation
│   │
│   ├── fix/remove-firebase-local-demo
│   ├── fix/workout-duration-validation
│   └── fix/agent-input-validation
│
└── release/v1.0
```

## Branch Naming Convention

| Prefix | Purpose | Example |
|---|---|---|
| `feature/` | New functionality | `feature/workout-coach-agent` |
| `fix/` | Bug fix | `fix/remove-firebase-local-demo` |
| `bugfix/` | Alternative bug fix prefix | `bugfix/agent-empty-prompt` |
| `docs/` | Documentation changes | `docs/mds-submission` |
| `refactor/` | Code refactoring | `refactor/api-layer` |
| `test/` | Adding tests | `test/backend-unit-tests` |

## Commit Message Convention

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types:
- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation change
- `test` — adding or updating tests
- `refactor` — code refactoring
- `ci` — CI/CD changes
- `chore` — build or dependency changes

### Examples:
```
feat(backend): Add Express server with PostgreSQL connection
feat(agents): Implement Workout Coach Agent with Groq fallback
fix(firebase): Disable Firebase init to prevent auth/invalid-api-key crash
fix(validation): Reject workout duration < 1 minute at backend level
docs(mds): Add user stories, backlog, bug reports, and diagrams
test(backend): Add Vitest + Supertest tests for all API endpoints
ci: Add GitHub Actions CI/CD pipeline for frontend and backend
```

## Pull Request Template

```markdown
## Description
<!-- What does this PR do? -->

## Related Issues
<!-- Closes #XX -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Tests
- [ ] Refactor

## How to Test
<!-- Steps to test this PR locally -->

## Checklist
- [ ] Code compiles without errors
- [ ] Tests pass (`npm test`)
- [ ] Frontend builds (`npm run build`)
- [ ] No breaking changes to existing features
```

## Recommended GitHub Issues

Based on the bug reports (`docs/bug-reports.md`):

| Issue # | Title | Branch | Labels |
|---|---|---|---|
| #1 | `FirebaseError: auth/invalid-api-key` on startup | `fix/remove-firebase-local-demo` | `bug`, `critical` |
| #2 | Workout duration accepts 0 or negative values | `fix/workout-duration-validation` | `bug`, `validation` |
| #3 | AI agent accepts missing userId / empty profile | `fix/agent-input-validation` | `bug`, `security` |
