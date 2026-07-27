# Local Setup Guide

## Requirements

- **Node.js** (LTS) and **npm**
- Playwright browsers installed via the project (no global Playwright install required)

## Setup

1. **Clone the repository** and open the project root (`allright-test-assignment`).

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env`** in the project root (gitignored). Useful variables:

   | Variable            | Example  | Description                                                             |
   | ------------------- | -------- | ----------------------------------------------------------------------- |
   | `SERVER`            | `stage`  | `stage` → `https://stage.allright.com`, `prod` → `https://allright.com` |
   | `BROWSER_NAME`      | `webkit` | Playwright browser (`webkit`, `chromium`, …)                            |
   | `DEVICE_TYPE`       | `Ios`    | Device preset from `src/data/devices.mapper.ts` (default `Ios`)         |
   | `HEADLESS`          | `true`   | Run headless when `true`                                                |
   | `WHO_FILLS_FORM`    | `child`  | Who fills the form modal: `child` or `parent`                           |
   | `LOG_LEVEL`         | `info`   | Logger level                                                            |
   | `GROUP_SCREENSHOTS` | `true`   | Optional screenshot grouping                                            |

   Admin API cleanup uses the bearer token from `ember_simple_auth-session` in localStorage after the smoke test opens the admin panel — no separate admin token env var is required.

4. **Install browsers**

   ```bash
   npx playwright install
   ```

5. **Run smoke tests**

   ```bash
   npx playwright test --project=smoke
   ```

   Headed (if `HEADLESS` is not `true`):

   ```bash
   HEADLESS=false npx playwright test --project=smoke
   ```

## Useful scripts

| Script                 | Command                 | Description                      |
| ---------------------- | ----------------------- | -------------------------------- |
| Playwright HTML report | `npm run pw_report`     | Open last Playwright HTML report |
| Allure report          | `npm run allure_report` | Generate and open Allure report  |
| Lint                   | `npm run lint`          | ESLint                           |
| Prettier               | `npm run prettier`      | Format check                     |

## Docker (optional)

A `Dockerfile` is in the repo root if you need a containerized Playwright environment. Typical flow:

```bash
docker build -t allright-pw .
```

Prefer local `npx playwright test` for day-to-day work.
