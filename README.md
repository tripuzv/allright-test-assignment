# Allright test assignment

Playwright + TypeScript E2E for the All Right Charlie sign-up funnel (`stage.allright.com`).

## What the smoke asserts

1. User is created — `POST /api/v1/users` → id stored
2. Trial entitlement — `user-balances` has TutorTypes `alias=trial` with available/bonus lessons > 0
3. Funnel completed — thank-you (`request-gotten`)
4. Identity fields from UI match API payloads (phone / email / names)

Screen-by-screen POM is only how the test reaches those outcomes.

## Assumptions

- Stage creates real users and balances (side effects)
- Charlie long funnel grants trial as a balance credit, not necessarily a scheduled calendar lesson
- Entry URL: `/uk/app/sign-up/long/charlie/age-range`

## Quick start

```bash
npm install
npx playwright install
# create .env — see docs/LOCAL_SETUP.md
npx playwright test --project=smoke
```

Reports: `npm run pw_report` / `npm run allure_report`

## Docs

- [Local Setup](./docs/LOCAL_SETUP.md)
- [Project Structure](./docs/PROJECT_STRUCTURE.md)
- [Test Coverage](./docs/TEST_COVERAGE_CHECKLIST.md)
- [Reports](./docs/REPORTS.md)
- [CI Setup](./docs/CI_SETUP.md)
