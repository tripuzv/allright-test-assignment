# CI notes

This assignment is set up for **local** Playwright runs. There is **no GitLab/GitHub CI pipeline** configured in this repository.

## What to use instead

- Run smoke locally: `npx playwright test --project=smoke`
- Inspect results with [Reports Guide](./REPORTS.md)

## If you add CI later

Suggested inputs (aligned with current `.env` / `playwright.config.ts`):

| Input | Example | Maps to |
|-------|---------|---------|
| Environment | `stage` / `prod` | `SERVER` |
| Browser | `webkit` / `chromium` | `BROWSER_NAME` |
| Device | `Ios` / `Android` | `DEVICE_TYPE` |
| Headless | `true` / `false` | `HEADLESS` |
| Who fills form | `child` / `parent` | `WHO_FILLS_FORM` |

Wire those as CI variables and run `npx playwright test --project=smoke`.
