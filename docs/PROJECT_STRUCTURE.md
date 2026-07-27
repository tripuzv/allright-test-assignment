# Project Structure

Organization of the **Allright test assignment** Playwright framework.

## Root

```
allright-test-assignment/
├── docs/                 # Documentation
├── src/                  # Framework source
├── tests/                # Specs (smoke.spec.ts)
├── artifacts/            # Screenshots / artifacts (generated)
├── allure-results/       # Allure raw results (generated)
├── allure-report/        # Allure HTML (generated)
├── playwright-report/    # Playwright HTML (generated)
├── test-results/         # Traces / failures (generated)
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── Dockerfile
└── README.md
```

## `src/`

### `config/`

- `global.setup.ts` — load `.env`, prepare dirs
- `global.teardown.ts` — post-run cleanup / report hooks

### `constants/`

- `timeouts.constants.ts`
- `url.constants.ts` — stage / prod bases

### `context/`

- `test.context.ts`, `use.test.context.ts` — shared `page` / `testInfo` / reporter

### `data/`

- `devices.mapper.ts` — iOS / Android device presets
- `templates/onboarding.template.mapper.ts` — route → onboarding page object
- `magic-strings/` — path helpers

### `decorators/`

- `step.ts` — `@step("...")` → Playwright/Allure step

### `helpers/`

- `asserts/` — soft assertion helpers
- `elements/` — clicks, waits, Allure attach for chosen options
- `env/` — `SERVER`, `BROWSER_NAME`, `WHO_FILLS_FORM`, `S3_*`, …
- `s3/` — `aws s3 sync` + CloudFront URL builder
- `logger/`, `math/`, `screenshot/`, `storage/` (`global-data.storage.ts`)
- `user-data/` — email / phone / faker helpers
- `date/`

### `interceptors/`

- `api-network.interceptor.ts` — capture `/api/v1` request/response bodies

### `pageobjects/`

- `base/` — `base.po.ts`, `onboarding.po.ts`
- `general/` — `cookie-banner.po.ts`
- `onboarding/` — Charlie funnel screens (`age-range`, `child-hobby`, `user-info-*`, `request-gotten`, …)

### `services/`

- `start.service.ts` — open URL, cookies, experiment
- `onboarding.service.ts` — funnel loop, API validation hooks
- `base.service.ts`

### `validators/`

- `api-schema.validator.ts` — Ajv
- `onboarding-api.validator.ts` — schema + identity checks
- `schemas/backend/request|response/` — JSON schemas from live `/api/v1` samples

### `reports/`

- `reporter.ts`, `stat.util.ts` — Allure attachments / stats helpers

### `types/`

- `global.types.ts`

## `tests/`

- `smoke.spec.ts` — `@smoke` E2E: Start Flow → Onboarding processing

## Config highlights

### `playwright.config.ts`

- Project: `smoke` → `smoke.spec.ts`
- Mobile device from `DEVICE_TYPE` (default iOS)
- Reporters: list, HTML, Allure
- Trace: `on`

### Path aliases (`tsconfig.json`)

`@pom/*`, `@services/*`, `@helpers/*`, `@validators/*`, `@interceptors/*`, `@data/*`, `@constants/*`, `@context/*`, `@decorators/*`, `@reports/*`, …

## Architecture

1. **POM** — screen interactions, locale-independent selectors (`button[data-mode]`, `button.btn.orange`, …)
2. **Services** — orchestrate start + onboarding loop (`test.step(\`Process ${screen} screen\`)`)
3. **Interceptor + validators** — assert `/api/v1` schemas and that email/phone/names match `globalStore`
4. **Store** — `userEmail`, `userPhone`, `parentName`, `childName`, chosen options, experiment

## Notes

- Generated dirs are gitignored
- `.env` is gitignored — see [Local Setup](./LOCAL_SETUP.md)
