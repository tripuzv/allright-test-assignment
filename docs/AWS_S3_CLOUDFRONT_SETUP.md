# AWS: S3 + CloudFront для QA reports (HTTP Basic Auth)

Гайд для хостингу **Allure**, **Playwright HTML** і **grouped screenshots** під паролем.  
Без custom domain — достатньо `*.cloudfront.net`.

Рекомендований layout (як у Finestro):

```text
s3://{BUCKET}/web/{SERVER}/{SUITE}/{allure|trace|screenshots}/{YYYY}/{MM}/{DD}/{HH}/{mm}/{ss}/
```

| Тип | Локальна папка | Entry URL |
|-----|----------------|-----------|
| `allure` | `allure-report/` | `.../index.html` |
| `trace` | `playwright-report/` | `.../index.html` |
| `screenshots` | HTML (+ png якщо потрібні) | `.../grouped-screenshots.html` |

Публічне посилання: `{S3_DOMAIN}/web/.../index.html`  
де `S3_DOMAIN` = `https://dxxxx.cloudfront.net` (без імені бакета).

---

## 0. Що підготувати

- AWS account + доступ до консолі (S3, CloudFront, IAM)
- Region для бакета: зручно **`us-east-1`** (Lambda@Edge теж лише звідти; для CloudFront Function region бакета вільніший)
- Логін/пароль для перегляду репортів (Basic Auth), окремо від upload keys
- Імена:
  - bucket: наприклад `allright-qa-reports-<account-id>`
  - IAM user: наприклад `github-actions-qa-reports`

---

## 1. S3 bucket

1. **S3 → Create bucket**
2. **Bucket name**: `allright-qa-reports-<id>`
3. **AWS Region**: `us-east-1` (або ваш вибір)
4. **Object Ownership**: **ACLs disabled** (Bucket owner enforced) — сучасний дефолт  
   → тоді в CI **не** використовуй `--acl bucket-owner-full-control`
5. **Block Public Access**: увімкни **всі** 4 чекбокси (бакет приватний)
6. Create bucket

### Lifecycle (опційно, як у Finestro — 14 днів)

1. Bucket → **Management** → **Create lifecycle rule**
2. Name: `expire-reports-14d`
3. Scope: whole bucket (або prefix `web/`)
4. Action: **Expire current versions of objects** → **14** days
5. Create rule

### CORS (зазвичай не треба)

Якщо Allure/Playwright відкриваються лише з того ж CloudFront origin — CORS не потрібен.

---

## 2. CloudFront distribution + OAC

1. **CloudFront → Create distribution**
2. **Origin**:
   - Origin domain: обери свій S3 bucket
   - Origin access: **Origin access control settings (recommended)**
   - Create OAC (default sign requests: `sigv4`) → Create
3. Після створення CloudFront покаже баннер: **Copy policy** → відкрий S3 bucket → **Permissions** → **Bucket policy** → Paste → Save  
   (дозволяє CloudFront читати об’єкти; публічно бакет лишається закритим)
4. **Viewer**:
   - Viewer protocol policy: **Redirect HTTP to HTTPS**
   - Allowed HTTP methods: **GET, HEAD** (достатньо для static reports)
5. **Default root object**: можна залишити порожнім (репорти лежать у вкладених шляхах з `index.html`)
6. **WAF**: Off (для QA ок)
7. Create distribution → дочекайся **Enabled**
8. Скопіюй **Distribution domain name**: `dxxxxxxxxxxxx.cloudfront.net` → це буде `S3_DOMAIN` (`https://dxxxxxxxxxxxx.cloudfront.net`)

Поки без Basic Auth розподіл віддасть 403/AccessDenied з S3 для прямих URL, якщо OAC ок — після upload можна перевірити доступ через CloudFront (після кроку 3 auth ще не буде).

---

## 3. HTTP Basic Auth (CloudFront Function)

Найпростіший варіант для QA: **CloudFront Function** на **viewer-request** з захардкоженим `user:pass` у Base64.

### 3.1 Згенеруй очікуваний header

Локально:

```bash
echo -n 'qa-reports:YourStrongPassword' | base64
# приклад: cWEtcmVwb3J0czpZb3VyU3Ryb25nUGFzc3dvcmQ=
```

Повний header value: `Basic cWEtcmVwb3J0czpZb3VyU3Ryb25nUGFzc3dvcmQ=`

### 3.2 Створи Function

1. **CloudFront → Functions → Create function**
2. Name: `qa-reports-basic-auth`
3. Код:

```javascript
function handler(event) {
  var request = event.request;
  var headers = request.headers;

  // Replace with your Base64("user:password")
  var expected = "Basic cWEtcmVwb3J0czpZb3VyU3Ryb25nUGFzc3dvcmQ=";

  if (
    headers.authorization &&
    headers.authorization.value === expected
  ) {
    return request;
  }

  return {
    statusCode: 401,
    statusDescription: "Unauthorized",
    headers: {
      "www-authenticate": { value: 'Basic realm="QA Reports"' },
    },
  };
}
```

4. **Save** → **Publish**

### 3.3 Прив’яжи до distribution

1. Distribution → **Behaviors** → Default (`*`) → Edit
2. **Function associations**:
   - Viewer request → **CloudFront Functions** → `qa-reports-basic-auth`
3. Save changes → дочекайся deploy

Перевірка:

```bash
# без auth → 401
curl -I https://dxxxx.cloudfront.net/

# з auth → 403/404 поки немає об’єкта, але вже не 401
curl -I -u 'qa-reports:YourStrongPassword' https://dxxxx.cloudfront.net/
```

> **Альтернатива:** Lambda@Edge (теж viewer-request) — гнучкіше (Secrets Manager), але складніше: функція лише в `us-east-1`, окрема роль, довший publish. Для assignment вистачить CloudFront Function.

---

## 4. IAM user для upload з CI (GitHub Actions)

1. **IAM → Users → Create user**: `github-actions-qa-reports`
2. **Attach policies directly** → **Create policy** (JSON):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListBucket",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::allright-qa-reports-<id>",
      "Condition": {
        "StringLike": {
          "s3:prefix": ["web/*"]
        }
      }
    },
    {
      "Sid": "ReadWriteReports",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::allright-qa-reports-<id>/web/*"
    }
  ]
}
```

3. Attach policy to user → Create
4. User → **Security credentials** → **Create access key** → **Application running outside AWS**
5. Збережи `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (одноразово)

CloudFront URL і Basic Auth пароль **не** потрібні цьому user — лише Put/List у бакет.

---

## 5. GitHub Secrets / Variables

У репо: **Settings → Secrets and variables → Actions**

| Name | Type | Value |
|------|------|--------|
| `AWS_ACCESS_KEY_ID` | Secret | з кроку 4 |
| `AWS_SECRET_ACCESS_KEY` | Secret | з кроку 4 |
| `AWS_DEFAULT_REGION` | Variable або Secret | `us-east-1` |
| `S3_BUCKET` | Variable | `allright-qa-reports-<id>` (лише ім’я бакета) |
| `S3_DOMAIN` | Variable | `https://dxxxx.cloudfront.net` |

Basic Auth user/pass тримай у password manager команди; у CI вони **не** потрібні для upload.

---

## 6. Ручна перевірка upload (до CI)

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=us-east-1
export S3_BUCKET=allright-qa-reports-<id>
export S3_DOMAIN=https://dxxxx.cloudfront.net

STAMP=$(date -u +%Y/%m/%d/%H/%M/%S)
PREFIX="web/stage/smoke"

# Allure (після npm run allure generate)
aws s3 sync allure-report/ "s3://${S3_BUCKET}/${PREFIX}/allure/${STAMP}/" --only-show-errors

# Playwright HTML
aws s3 sync playwright-report/ "s3://${S3_BUCKET}/${PREFIX}/trace/${STAMP}/" --only-show-errors

# Grouped screenshots
aws s3 cp artifacts/grouped-screenshots.html \
  "s3://${S3_BUCKET}/${PREFIX}/screenshots/${STAMP}/grouped-screenshots.html" \
  --only-show-errors
```

Відкрий у браузері (введеш Basic Auth):

```text
${S3_DOMAIN}/${PREFIX}/allure/${STAMP}/index.html
${S3_DOMAIN}/${PREFIX}/trace/${STAMP}/index.html
${S3_DOMAIN}/${PREFIX}/screenshots/${STAMP}/grouped-screenshots.html
```

Якщо HTML відкривається, а картинки/асети 404 — перевір, що `aws s3 sync` залив **усю** папку `allure-report/` / `playwright-report/`, не лише `index.html`.

Для grouped screenshots, якщо HTML посилається на `screenshots/*.png`, синхронізуй і png у той самий prefix (або поправ відносні шляхи в HTML).

---

## 7. Content-Type / index

- `aws s3 sync` зазвичай ставить `text/html`, `application/javascript`, тощо коректно
- Якщо браузер качає файл замість рендеру — вистав:

```bash
aws s3 cp ./index.html "s3://${S3_BUCKET}/.../index.html" \
  --content-type "text/html; charset=utf-8"
```

---

## 8. CI (вже в репо)

Після кроків 1–5 додай Secrets/Variables з кроку 5 і запусти **Playwright Smoke**.

- Teardown: Allure + grouped screenshots → S3, пише `artifacts/report-urls.txt`
- Post-step: `playwright-report/` → S3 (шлях з `artifacts/trace_report_s3_bucket.txt`)
- Job step **Print report URLs** виводить три лінки

Деталі: [CI Setup](./CI_SETUP.md).

---

## Checklist

- [ ] Private S3 + Block Public Access
- [ ] Lifecycle 14d (опційно)
- [ ] CloudFront + OAC + bucket policy
- [ ] CloudFront Function Basic Auth на viewer-request
- [ ] IAM user лише на `web/*`
- [ ] Secrets у GitHub
- [ ] Ручний sync + відкриття 3 URL під паролем

## Типові проблеми

| Симптом | Ймовірна причина |
|---------|------------------|
| `403` з CloudFront без 401 | Function не прив’язана / не Published |
| `401` завжди | Невірний Base64 / зайвий `\n` у `echo` (використовуй `echo -n`) |
| `AccessDenied` на sync | IAM / wrong bucket name / ACLs |
| HTML ок, CSS/JS биті | Залитий лише `index.html`, не вся папка |
| Посилання з бакетом у URL | Використовуй `S3_DOMAIN`, не `S3_BUCKET` як host |
