# Allright test assignment

Playwright + TypeScript E2E framework for the All Right sign-up funnel (`stage.allright.com` / `allright.com`). Covers the long Charlie onboarding quiz through user registration and thank-you screen, with API schema checks and identity-field validations.

## Overview

- **Flow**: smoke suite walks the Charlie onboarding funnel end-to-end (options, forms, thank-you / `request-gotten`)
- **Architecture**: Page Object Model, service layer (`StartService`, `OnboardingService`), network interceptor + Ajv schema validation
- **Reporting**: Playwright HTML report, Allure, per-screen screenshots, traces
- **Environments**: `stage` / `prod` via `.env` (`SERVER`)

## Documentation

- **[Local Setup Guide](./docs/LOCAL_SETUP.md)** — install and run tests locally
- **[Project Structure](./docs/PROJECT_STRUCTURE.md)** — directories and architecture
- **[Test Coverage](./docs/TEST_COVERAGE_CHECKLIST.md)** — what the smoke flow covers
- **[Reports Guide](./docs/REPORTS.md)** — local reports and artifacts
- **[CI Setup](./docs/CI_SETUP.md)** — GitHub Actions smoke workflow
- **[AWS reports hosting](./docs/AWS_S3_CLOUDFRONT_SETUP.md)** — S3 + CloudFront + HTTP Basic Auth

## Quick start

```bash
npm install
npx playwright install
# create .env — see Local Setup
npx playwright test --project=smoke
```

Open reports:

```bash
npm run pw_report
npm run allure_report
```
