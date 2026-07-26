# CI Setup (GitHub Actions)

Smoke E2E via **GitHub Actions** (`workflow_dispatch`). After the run, Allure / Playwright HTML / grouped screenshots are uploaded to **S3** and public CloudFront URLs are printed in the job log.

## Workflow

File: [`.github/workflows/playwright-smoke.yml`](../.github/workflows/playwright-smoke.yml)

|           |                                                                                 |
| --------- | ------------------------------------------------------------------------------- |
| Trigger   | Actions → **Playwright Smoke** → **Run workflow**                               |
| Image     | `mcr.microsoft.com/playwright:v1.61.0-noble`                                    |
| Command   | `npx playwright test --project=smoke`                                           |
| S3 path   | `s3://{S3_BUCKET}/web/{SERVER}/smoke/{allure\|trace\|screenshots}/{timestamp}/` |
| Artifacts | also kept on the Actions run (7 days)                                           |

## Inputs

| Input              | Options              | Env var             | Default  |
| ------------------ | -------------------- | ------------------- | -------- |
| `server`           | `stage`, `prod`      | `SERVER`            | `stage`  |
| `browserName`      | `webkit`, `chromium` | `BROWSER_NAME`      | `webkit` |
| `deviceType`       | `Ios`, `Android`     | `DEVICE_TYPE`       | `Ios`    |
| `whoFillsForm`     | `child`, `parent`    | `WHO_FILLS_FORM`    | `child`  |
| `groupScreenshots` | boolean              | `GROUP_SCREENSHOTS` | `true`   |

Also set: `IS_CI=true`, `HEADLESS=true`, `SUITE=smoke`.

## GitHub Secrets / Variables

| Name                    | Where               | Purpose                        |
| ----------------------- | ------------------- | ------------------------------ |
| `AWS_ACCESS_KEY_ID`     | Secret              | IAM upload user                |
| `AWS_SECRET_ACCESS_KEY` | Secret              | IAM upload user                |
| `S3_BUCKET`             | Variable            | Bucket name only               |
| `S3_DOMAIN`             | Variable            | `https://dxxxx.cloudfront.net` |
| `AWS_DEFAULT_REGION`    | Variable (optional) | default `us-east-1`            |

## Report URLs in the job

Step **Print report URLs** prints:

```text
Allure:       https://dxxxx.cloudfront.net/web/stage/smoke/allure/.../index.html
Playwright:   https://dxxxx.cloudfront.net/web/stage/smoke/trace/.../index.html
Screenshots:  https://dxxxx.cloudfront.net/web/stage/smoke/screenshots/.../grouped-screenshots.html
```

- Allure + screenshots upload in **global teardown** (needs Java + AWS CLI in the job)
- Playwright HTML uploads in a **post-test step** (report is written after teardown)

Without `S3_BUCKET` / `S3_DOMAIN`, uploads are skipped (tests still run).

## How to run

1. Open the repo on GitHub → **Actions**
2. Select **Playwright Smoke** → **Run workflow**
3. Open the job log → **Print report URLs**
4. Open links in a browser (HTTP Basic Auth)

See also [Local Setup](./LOCAL_SETUP.md) and [Reports](./REPORTS.md).
