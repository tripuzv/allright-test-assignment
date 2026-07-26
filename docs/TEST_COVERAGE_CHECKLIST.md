# All Right — Test Coverage Checklist


Assignment: **Part B / Variant 1** — business outcomes of Charlie long funnel on stage.

---

## Business outcomes (contract)

- [x] User created — `POST /api/v1/users` → `createdUserId`
- [x] Trial entitlement — `GET .../user-balances` → TutorTypes `alias=trial` + available/bonus lessons &gt; 0
- [x] Funnel completed — `request-gotten` + `funnelCompleted`
- [x] Final step `validateBusinessOutcomes()` after funnel

## Supporting checks

- [x] Identity: email / phone / parent / child names vs API payloads
- [x] Ajv schemas for create / me / balances / update-email / update-user / child-hobbies
- [x] Experiment alias/variant attached from `localStorage` (diagnostic, not a gate)
- [x] Locale-independent option/CTA selectors

## Means to reach outcomes (Charlie screens)

Mapper-driven walkthrough (not the test contract): age-range → … → user-info-* → request-gotten.  
See historical list in git if needed; screens may change with A/B.

## Infrastructure

- [x] Playwright + TypeScript, POM + services
- [x] `ApiNetworkInterceptor`
- [x] Allure + Playwright HTML + grouped screenshots
- [x] GitHub Actions + optional S3/CloudFront report hosting

## Notes / gaps

- Trial here = **balance entitlement**, not always `lessons-scheduled &gt; 0` (observed on stage)
- Mid-funnel still has many POs — candidate to slim down (see [APPROACH.md](./APPROACH.md))
