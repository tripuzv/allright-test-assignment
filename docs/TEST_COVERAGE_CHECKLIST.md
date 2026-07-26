# Test coverage

Smoke for Charlie long funnel on stage. Focus: business outcomes, not A/B copy.

## Business outcomes

- [x] User created — `POST /api/v1/users` → `createdUserId`
- [x] Trial entitlement — `GET .../user-balances` → TutorTypes `alias=trial` + available/bonus lessons > 0
- [x] Funnel completed — `request-gotten` + `funnelCompleted`
- [x] Final step `validateBusinessOutcomes()` after funnel

## Supporting checks

- [x] Identity: email / phone / parent / child names vs API payloads
- [x] Ajv schemas for create / me / balances / update-email / update-user / child-hobbies
- [x] Experiment alias/variant from `localStorage` (diagnostic only)
- [x] Locale-independent option/CTA selectors

## How the test reaches outcomes

Mapper-driven walkthrough: age-range → … → user-info-* → request-gotten.  
Screen set may change with A/B; outcomes above are the contract.

## Infrastructure

- [x] Playwright + TypeScript, POM + services
- [x] `ApiNetworkInterceptor`
- [x] Allure + Playwright HTML + grouped screenshots
- [x] GitHub Actions + optional S3/CloudFront report hosting

## Notes

- Trial here means balance entitlement; `lessons-scheduled` may stay `0` on stage
- Mid-funnel still has many page objects — candidate to slim down later
