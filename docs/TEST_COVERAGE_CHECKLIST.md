# All Right — Test Coverage Checklist

*Last updated: 26 July 2026*

Scope of this assignment: **Charlie long sign-up funnel** smoke E2E on stage/prod.

---

## Fully covered

### 1. Start / entry

- [x] Open funnel URL (`/uk/app/sign-up/long/charlie/age-range`)
- [x] Cookie banner accept/reject
- [x] Read running experiment from `localStorage` → `globalStore` + Allure attachment

### 2. Onboarding screens (Charlie)

Processed via `OnboardingService` + `onboarding.template.mapper.ts` (locale-independent locators):

- [x] `age-range`
- [x] `child-know-english`
- [x] `plan-lesson`
- [x] `main-thing`
- [x] `schedule-flexibility`
- [x] `control-schedule` (info)
- [x] `child-device`
- [x] `child-device-advice` (info)
- [x] `speaking-clubs`
- [x] `speaking-clubs-info` (info)
- [x] `progress`
- [x] `homework`
- [x] `repeat-material` (info)
- [x] `lesson-format`
- [x] `child-name` (input → `globalStore.childName`)
- [x] `temperament-child`
- [x] `child-hobby` (multi-select + JS click)
- [x] `user-info-name` (parent name → `globalStore.parentName`, who-fills modal)
- [x] `user-info-phone` (valid E.164 / national for selected country → `globalStore.userPhone`)
- [x] `user-info-email` → `globalStore.userEmail`
- [x] `request-gotten` (thank-you, last step — UI validation only)

Per screen: screenshot, `test.step(\`Process ${screen} screen\`)`, wait for route change (except last).

### 3. API interception & schema validation

Captured under `/api/v1` (excluding `tutor-urls` / `experiments`):

| After screen | APIs | Schemas |
|--------------|------|---------|
| `child-hobby` | `GET /child-hobbies` | response |
| `user-info-phone` | `GET /users/check-captcha`, `POST /users`, `GET /users`, `GET /users/:id/user-balances` | request/response where applicable |
| `user-info-email` | `PATCH /users/:id/update-email`, `PATCH /users/:id` | request + response |

Ajv JSON Schema (`src/validators/schemas/backend/`).

### 4. Identity field checks

Against values stored on screens in `globalStore`:

- [x] Email (`userEmail`) in update-email / update-user payloads
- [x] Phone (`userPhone`, digit-normalized) in create / me / update payloads
- [x] Parent name (`parentName`)
- [x] Child name (`childName`)

---

## Not in scope (assignment)

- [ ] Payment / booking / upsell flows
- [ ] Amplitude / Reteno analytics validation
- [ ] Registration cabinet / change-password
- [ ] Monetization suite
- [ ] GitLab CI + S3 report hosting

---

## Infrastructure

- [x] Playwright + TypeScript
- [x] POM + services
- [x] `ApiNetworkInterceptor`
- [x] Allure + Playwright HTML + traces
- [x] Screenshots per onboarding screen
- [x] Soft assertions / logger / env config
- [x] Mobile device project (`smoke`, default iOS WebKit)

---

## Notes

- Entry path is hardcoded in `tests/smoke.spec.ts` for Charlie long funnel.
- Thank-you screen `request-gotten` is marked `isLastStep` — funnel stops after UI validation.
- Phone generation uses `phone-number-generator-js` + `libphonenumber-js` for national digits.
