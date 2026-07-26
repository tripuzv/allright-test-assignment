# CI Setup (GitHub Actions)

Smoke E2E runs via **GitHub Actions** (`workflow_dispatch`). Reports are **not** uploaded to S3 — artifacts stay on the Actions run for download.

## Workflow

File: [`.github/workflows/playwright-smoke.yml`](../.github/workflows/playwright-smoke.yml)

| | |
|--|--|
| Trigger | Actions → **Playwright Smoke** → **Run workflow** |
| Image | `mcr.microsoft.com/playwright:v1.61.0-noble` |
| Command | `npx playwright test --project=smoke` |
| Artifacts | `artifacts/`, `playwright-report/`, `allure-results/`, `test-results/` (7 days) |

## Inputs

| Input | Options | Env var | Default |
|-------|---------|---------|---------|
| `server` | `stage`, `prod` | `SERVER` | `stage` |
| `browserName` | `webkit`, `chromium` | `BROWSER_NAME` | `webkit` |
| `deviceType` | `Ios`, `Android` | `DEVICE_TYPE` | `Ios` |
| `whoFillsForm` | `child`, `parent` | `WHO_FILLS_FORM` | `child` |
| `groupScreenshots` | boolean | `GROUP_SCREENSHOTS` | `true` |

Also set in the job: `IS_CI=true`, `HEADLESS=true`, `CI=true`.

## How to run

1. Open the repo on GitHub → **Actions**
2. Select **Playwright Smoke**
3. **Run workflow** → choose inputs → **Run workflow**
4. When finished, download the run artifact from the job summary

## Out of scope (for now)

- S3 / Slack report publishing
- Monetization suite (not in this assignment)
- Writing secret JSON files (`api-data`, payment cards, proxy)

## Local equivalent

```bash
SERVER=stage \
BROWSER_NAME=webkit \
DEVICE_TYPE=Ios \
WHO_FILLS_FORM=child \
HEADLESS=true \
IS_CI=true \
npx playwright test --project=smoke
```

See also [Local Setup](./LOCAL_SETUP.md) and [Reports](./REPORTS.md).
